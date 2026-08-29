import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage, apiValidationErrors, ValidationErrorsByField } from '@core/api/api-error';
import { SessionStore } from '@core/session/session.store';
import { AlertService } from '@shared/components/alerts/alert.service';
import {
  RefactorSelectComponent,
  RefactorSelectOption,
} from '@shared/components/inputs/refactor-select/refactor-select.component';
import { RoleRes, UserRes } from '../../../admin/data-access/admin.dtos';
import { RoleService } from '../../../admin/data-access/role.service';
import { UserService } from '../../../admin/data-access/user.service';
import { AssignPersonnelPayload, Branch } from '../../data-access/organization.dtos';
import { OrganizationApiService } from '../../data-access/organization-api.service';

type ScopeType = 'GLOBAL' | 'BRANCH';
type AssignmentField = 'role' | 'branch' | 'startDate' | 'reason';

const BRANCH_SCOPED_ROLE_CODES = new Set([
  'branch_manager',
  'coordinator',
  'verifier',
  'cashier',
]);

function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function roleScope(role: RoleRes | null): ScopeType | null {
  if (!role) return null;
  return BRANCH_SCOPED_ROLE_CODES.has(role.code) ? 'BRANCH' : 'GLOBAL';
}

@Component({
  selector: 'app-staff-assignment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RefactorSelectComponent],
  templateUrl: './staff-assignment.html',
  styleUrls: ['./staff-assignment.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffAssignment implements OnInit {
  private readonly api = inject(OrganizationApiService);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertService);
  protected readonly sessionStore = inject(SessionStore);

  readonly userId = this.route.snapshot.paramMap.get('id');
  readonly staff = signal<UserRes | null>(null);
  readonly roles = signal<RoleRes[]>([]);
  readonly branches = signal<Branch[]>([]);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly showConfirmModal = signal(false);
  readonly pageError = signal('');
  readonly validationErrors = signal<ValidationErrorsByField>({});
  readonly touchedFields = signal<ReadonlySet<AssignmentField>>(new Set());

  readonly roleId = signal('');
  readonly branchId = signal('');
  readonly startDate = signal(localDateKey());
  readonly reason = signal('');
  readonly today = localDateKey();

  readonly isBranchManager = computed(
    () =>
      this.sessionStore.roles().includes('branch_manager') &&
      !this.sessionStore.roles().includes('general_manager'),
  );
  readonly managerBranchId = computed(
    () =>
      this.sessionStore.activeBranch() ??
      this.sessionStore.scopes().find((scope) => scope.role === 'branch_manager')?.branchId ??
      null,
  );
  readonly managerBranch = computed(
    () => this.branches().find((branch) => branch.id === this.managerBranchId()) ?? null,
  );
  readonly selectedRole = computed(
    () => this.roles().find((role) => role.id === this.roleId()) ?? null,
  );
  readonly selectedScope = computed(() => roleScope(this.selectedRole()));
  readonly requiresBranch = computed(() => this.selectedScope() === 'BRANCH');
  readonly visibleBranches = computed(() => {
    let available = this.branches().filter((branch) => branch.status === 'ACTIVE');
    const role = this.selectedRole();

    if (this.isBranchManager()) {
      const managerBranchId = this.managerBranchId();
      available = available.filter((branch) => branch.id === managerBranchId);
    }

    if (role?.code === 'branch_manager') {
      available = available.filter(
        (branch) => !branch.is_headquarters && !branch.has_branch_manager,
      );
    }

    return available;
  });
  readonly roleOptions = computed<readonly RefactorSelectOption[]>(() =>
    this.roles().map((role) => ({
      value: role.id,
      label: role.name,
      description: roleScope(role) === 'GLOBAL' ? 'Alcance global' : 'Requiere una sucursal',
      tone: 'green',
    })),
  );
  readonly branchOptions = computed<readonly RefactorSelectOption[]>(() =>
    this.visibleBranches().map((branch) => ({
      value: branch.id,
      label: `${branch.code} · ${branch.name}`,
      tone: 'green',
    })),
  );
  readonly selectedBranch = computed(
    () => this.visibleBranches().find((branch) => branch.id === this.branchId()) ?? null,
  );
  readonly targetCanBeAssigned = computed(() => {
    const target = this.staff();
    return Boolean(
      target && target.state === 'ACTIVE' && target.id !== this.sessionStore.user()?.id,
    );
  });
  readonly formIsValid = computed(() => {
    const role = this.selectedRole();
    const date = this.startDate();
    const branchIsValid =
      !this.requiresBranch() ||
      this.visibleBranches().some((branch) => branch.id === this.branchId());

    return Boolean(
      this.targetCanBeAssigned() &&
        role &&
        this.selectedScope() &&
        branchIsValid &&
        isValidDateKey(date) &&
        date <= this.today &&
        this.reason().trim().length > 0 &&
        this.reason().trim().length <= 500,
    );
  });

  async ngOnInit(): Promise<void> {
    if (!this.userId) {
      this.pageError.set('No se indicó el usuario que se desea asignar.');
      this.isLoading.set(false);
      return;
    }

    try {
      const [staff, roles, branches] = await Promise.all([
        firstValueFrom(this.userService.getUser(this.userId)),
        firstValueFrom(this.roleService.getAssignableRoles()),
        firstValueFrom(this.api.getBranches({ per_page: 100, status: 'ACTIVE' })),
      ]);

      this.staff.set(staff);
      this.roles.set(roles.filter((role) => role.is_active !== false));
      this.branches.set(branches.data.filter((branch) => branch.status === 'ACTIVE'));

      if (this.isBranchManager() && !this.managerBranch()) {
        this.pageError.set('No se encontró una sucursal activa asociada a tu alcance.');
      }
    } catch (error: unknown) {
      this.pageError.set(
        apiErrorMessage(error, 'No fue posible cargar los datos de la asignación.'),
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  onRoleChange(roleId: string): void {
    this.roleId.set(roleId);
    this.branchId.set(this.isBranchManager() ? this.managerBranchId() ?? '' : '');
    this.pageError.set('');
    this.clearValidationErrors('role_id', 'branch_id');
    this.markFieldAsTouched('role');
  }

  onBranchChange(branchId: string): void {
    this.branchId.set(branchId);
    this.pageError.set('');
    this.clearValidationErrors('branch_id');
    this.markFieldAsTouched('branch');
  }

  onStartDateChange(value: string): void {
    this.startDate.set(value);
    this.pageError.set('');
    this.clearValidationErrors('assigned_at');
  }

  onReasonChange(value: string): void {
    this.reason.set(value.slice(0, 500));
    this.pageError.set('');
    this.clearValidationErrors('assignment_reason');
  }

  markFieldAsTouched(field: AssignmentField): void {
    this.touchedFields.update((fields) => new Set([...fields, field]));
  }

  fieldError(field: AssignmentField): string | null {
    const serverField = this.serverField(field);
    const serverError = this.validationErrors()[serverField]?.[0];
    if (serverError) return serverError;
    if (!this.touchedFields().has(field)) return null;

    if (field === 'role' && !this.selectedRole()) return 'Selecciona un rol válido.';
    if (field === 'branch' && this.requiresBranch()) {
      if (!this.branchId()) return 'Selecciona una sucursal.';
      if (!this.visibleBranches().some((branch) => branch.id === this.branchId())) {
        return 'La sucursal seleccionada no está disponible para tu alcance.';
      }
    }
    if (field === 'startDate') {
      if (!this.startDate()) return 'Selecciona la fecha efectiva.';
      if (!isValidDateKey(this.startDate())) return 'La fecha efectiva no es válida.';
      if (this.startDate() > this.today) return 'La fecha efectiva no puede ser posterior a hoy.';
    }
    if (field === 'reason') {
      if (!this.reason().trim()) return 'El motivo de asignación es obligatorio.';
      if (this.reason().trim().length > 500) return 'El motivo no puede superar 500 caracteres.';
    }

    return null;
  }

  openConfirmModal(): void {
    this.markAllFieldsAsTouched();
    if (!this.targetCanBeAssigned()) {
      this.pageError.set(
        'Solo se pueden asignar usuarios activos y no puedes modificar tu propio acceso.',
      );
      return;
    }
    if (!this.formIsValid()) {
      this.pageError.set('Completa los campos obligatorios con datos válidos antes de continuar.');
      return;
    }

    this.pageError.set('');
    this.showConfirmModal.set(true);
  }

  closeConfirmModal(): void {
    if (!this.isSubmitting()) this.showConfirmModal.set(false);
  }

  async submitAssignment(): Promise<void> {
    if (!this.userId || !this.formIsValid() || this.isSubmitting()) {
      this.markAllFieldsAsTouched();
      this.showConfirmModal.set(false);
      return;
    }

    const role = this.selectedRole();
    const scope = this.selectedScope();
    if (!role || !scope) return;

    const payload: AssignPersonnelPayload = {
      role_id: role.id,
      branch_id: scope === 'BRANCH' ? this.branchId() : null,
      scope,
      assigned_at: `${this.startDate()}T00:00:00`,
      assignment_reason: this.reason().trim(),
    };

    this.isSubmitting.set(true);
    this.pageError.set('');
    this.validationErrors.set({});
    try {
      await firstValueFrom(this.api.assignPersonnel(this.userId, payload));
      this.alerts.success('La asignación se guardó correctamente.');
      await this.router.navigate(['/organizacion/personal', this.userId]);
    } catch (error: unknown) {
      this.validationErrors.set(apiValidationErrors(error));
      this.pageError.set(apiErrorMessage(error, 'No fue posible guardar la asignación.'));
      this.showConfirmModal.set(false);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private markAllFieldsAsTouched(): void {
    this.touchedFields.set(new Set(['role', 'branch', 'startDate', 'reason']));
  }

  private serverField(field: AssignmentField): string {
    return {
      role: 'role_id',
      branch: 'branch_id',
      startDate: 'assigned_at',
      reason: 'assignment_reason',
    }[field];
  }

  private clearValidationErrors(...fields: string[]): void {
    const errors = { ...this.validationErrors() };
    fields.forEach((field) => delete errors[field]);
    this.validationErrors.set(errors);
  }
}
