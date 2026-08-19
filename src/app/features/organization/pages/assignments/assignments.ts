import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '@core/api/api-error';
import { SessionStore } from '@core/session/session.store';
import { UserRes } from '../../../admin/data-access/admin.dtos';
import { UserService } from '../../../admin/data-access/user.service';
import { OrganizationApiService } from '../../data-access/organization-api.service';
import { MisvalesDateTimePipe } from '../../../../shared/pipes/misvales-date-time.pipe';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { AlertService } from '../../../../shared/services/alert.service';
import {
  Branch,
  CoordinatorDistributorAssignment,
  DistributorCandidate,
  PersonnelAssignment,
} from '../../data-access/organization.dtos';

type OrganizationalRole = {
  id: string;
  code: string;
  name: string;
};

export type PersonnelCandidate = {
  id: string;
  name: string;
  email: string;
  role: OrganizationalRole;
  isReactivation: boolean;
};

const ORGANIZATIONAL_ROLE_CODES = new Set(['branch_manager', 'coordinator', 'verifier', 'cashier']);

export function personnelCandidates(
  users: UserRes[],
  personnelHistory: PersonnelAssignment[],
): PersonnelCandidate[] {
  const candidates = new Map<string, PersonnelCandidate>();
  const activeAssignmentUserIds = new Set(
    personnelHistory
      .filter((assignment) => assignment.assignment_status === 'ACTIVE')
      .map((assignment) => assignment.user.id),
  );

  for (const user of users) {
    const role = organizationalRole(user);
    if (user.state !== 'ACTIVE' || !role || activeAssignmentUserIds.has(user.id)) continue;

    candidates.set(user.id, {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      isReactivation: false,
    });
  }

  for (const assignment of personnelHistory) {
    if (
      assignment.assignment_status !== 'REVOKED'
      || assignment.user.state !== 'ACTIVE'
      || candidates.has(assignment.user.id)
      || activeAssignmentUserIds.has(assignment.user.id)
    ) {
      continue;
    }

    const role = assignment.role;
    if (!ORGANIZATIONAL_ROLE_CODES.has(role.code)) continue;

    candidates.set(assignment.user.id, {
      id: assignment.user.id,
      name: assignment.user.name,
      email: assignment.user.email,
      role,
      isReactivation: true,
    });
  }

  return [...candidates.values()].sort((left, right) => left.name.localeCompare(right.name, 'es'));
}

function organizationalRole(user: UserRes): OrganizationalRole | null {
  const role = user.role_scopes?.find((scope) =>
    typeof scope.role.id === 'string'
    && typeof scope.role.code === 'string'
    && ORGANIZATIONAL_ROLE_CODES.has(scope.role.code),
  )?.role;

  return role?.id && role.code ? { id: role.id, code: role.code, name: role.name } : null;
}

@Component({
  selector: 'app-organization-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MisvalesDateTimePipe, StatusLabelPipe],
  templateUrl: './assignments.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentsPage implements OnInit {
  private readonly api = inject(OrganizationApiService);
  private readonly userService = inject(UserService);
  private readonly session = inject(SessionStore);
  private readonly alerts = inject(AlertService);

  readonly branches = signal<Branch[]>([]);
  readonly users = signal<UserRes[]>([]);
  readonly personnel = signal<PersonnelAssignment[]>([]);
  readonly personnelHistory = signal<PersonnelAssignment[]>([]);
  readonly distributorAssignments = signal<CoordinatorDistributorAssignment[]>([]);
  readonly distributors = signal<DistributorCandidate[]>([]);
  readonly selectedBranch = signal<Branch | null>(null);
  readonly activeTab = signal<'personnel' | 'distributors'>('personnel');
  readonly personnelStatus = signal<PersonnelAssignment['assignment_status']>('ACTIVE');
  readonly isLoading = signal(false);
  readonly actionLoading = signal(false);
  readonly pageError = signal('');
  readonly pageMessage = signal('');
  readonly personnelForm = signal({ user_id: '', reason: '' });
  readonly personnelTouchedFields = signal<ReadonlySet<'user_id' | 'reason'>>(new Set());
  readonly distributorForm = signal({ distributor_id: '', coordinator_id: '', reason: '' });
  readonly pendingWithdrawal = signal<
    | { type: 'personnel'; assignment: PersonnelAssignment }
    | { type: 'distributor'; assignment: CoordinatorDistributorAssignment }
    | null
  >(null);
  readonly withdrawalReason = signal('');
  readonly withdrawalReasonTouched = signal(false);

  readonly eligibleUsers = computed(() => personnelCandidates(this.users(), this.personnelHistory()));
  readonly selectedPersonnelCandidate = computed(() =>
    this.eligibleUsers().find((candidate) => candidate.id === this.personnelForm().user_id) ?? null,
  );
  readonly selectedPersonnelRole = computed(() => this.selectedPersonnelCandidate()?.role ?? null);
  readonly coordinators = computed(() => {
    const seen = new Set<string>();
    return this.personnel()
      .filter((assignment) => assignment.assignment_status === 'ACTIVE' && assignment.role.code === 'coordinator')
      .filter((assignment) => seen.has(assignment.user.id) ? false : (seen.add(assignment.user.id), true));
  });
  readonly canManagePersonnel = computed(() => this.hasPermission('roles.assign'));
  readonly canManageDistributors = computed(() => this.hasPermission('assignments.manage'));

  async ngOnInit(): Promise<void> {
    await this.loadCatalogs();
  }

  async loadCatalogs(): Promise<void> {
    this.isLoading.set(true);
    this.pageError.set('');
    try {
      const [branches, users] = await Promise.all([
        firstValueFrom(this.api.getBranches({ per_page: 100, status: 'ACTIVE' })),
        firstValueFrom(this.userService.getUsers({ page: 1, per_page: 100 })),
      ]);
      this.branches.set(branches.data);
      this.users.set(users.data);
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cargar la estructura organizacional.'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async openBranch(branch: Branch): Promise<void> {
    this.selectedBranch.set(branch);
    this.activeTab.set('personnel');
    this.personnelStatus.set('ACTIVE');
    this.pageMessage.set('');
    await this.reload();
  }

  showBranches(): void {
    this.selectedBranch.set(null);
    this.personnel.set([]);
    this.personnelHistory.set([]);
    this.distributorAssignments.set([]);
    this.distributors.set([]);
    this.pageError.set('');
    this.pageMessage.set('');
  }

  async reload(): Promise<void> {
    const branch = this.selectedBranch();
    if (!branch) return;

    this.isLoading.set(true);
    this.pageError.set('');
    try {
      const [personnel, personnelHistory, coordinatorAssignments, distributors] = await Promise.all([
        firstValueFrom(this.api.getBranchAssignments(branch.id, { status: this.personnelStatus() })),
        firstValueFrom(this.api.getBranchAssignments(branch.id, { includeHistory: true })),
        firstValueFrom(this.api.getCoordinatorDistributorAssignments(branch.id)),
        firstValueFrom(this.api.getActiveDistributorCandidates(branch.id)),
      ]);
      this.personnel.set(personnel.data);
      this.personnelHistory.set(personnelHistory.data);
      this.distributorAssignments.set(coordinatorAssignments);
      this.distributors.set(distributors);
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cargar las asignaciones de la sucursal.'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async changePersonnelStatus(status: string): Promise<void> {
    if (status !== 'ACTIVE' && status !== 'REVOKED') return;
    if (this.personnelStatus() === status) return;

    this.personnelStatus.set(status);
    await this.reload();
  }

  async assignPersonnel(): Promise<void> {
    const branch = this.selectedBranch();
    const form = this.personnelForm();
    const candidate = this.selectedPersonnelCandidate();
    const role = this.selectedPersonnelRole();
    const roleId = role?.id;
    if (!branch || !form.user_id || !roleId || !form.reason.trim()) {
      this.markPersonnelFieldAsTouched('user_id');
      this.markPersonnelFieldAsTouched('reason');
      return;
    }

    await this.runAction(async () => {
      await firstValueFrom(this.api.assignPersonnel(form.user_id, {
        role_id: roleId,
        branch_id: branch.id,
        scope: 'BRANCH',
        assignment_reason: form.reason.trim(),
      }));
      this.personnelForm.set({ user_id: '', reason: '' });
      this.personnelTouchedFields.set(new Set());
      this.alerts.success(candidate?.isReactivation
        ? `${candidate.name} se reactivó como ${role.name}.`
        : 'El personal quedó asignado con el rol que ya tiene registrado.');
    });
  }

  requestEndPersonnel(assignment: PersonnelAssignment): void {
    this.withdrawalReason.set('');
    this.withdrawalReasonTouched.set(false);
    this.pendingWithdrawal.set({ type: 'personnel', assignment });
  }

  async assignDistributor(): Promise<void> {
    const branch = this.selectedBranch();
    const form = this.distributorForm();
    if (!branch || !form.distributor_id || !form.coordinator_id || !form.reason.trim()) {
      this.pageError.set('Seleccione distribuidora, coordinador y motivo.');
      return;
    }

    await this.runAction(async () => {
      await firstValueFrom(this.api.assignCoordinatorDistributor({
        branch_id: branch.id,
        distributor_id: form.distributor_id,
        coordinator_id: form.coordinator_id,
        assignment_reason: form.reason.trim(),
      }));
      this.distributorForm.set({ distributor_id: '', coordinator_id: '', reason: '' });
      this.pageMessage.set('La distribuidora quedó asignada al coordinador seleccionado.');
    });
  }

  requestEndDistributor(assignment: CoordinatorDistributorAssignment): void {
    if (assignment.distributor?.status === 'ACTIVE') {
      this.pageError.set('Una distribuidora activa debe reasignarse; no puede quedar sin coordinador.');
      return;
    }
    this.withdrawalReason.set('');
    this.withdrawalReasonTouched.set(false);
    this.pendingWithdrawal.set({ type: 'distributor', assignment });
  }

  closeWithdrawalDialog(): void {
    this.pendingWithdrawal.set(null);
    this.withdrawalReason.set('');
    this.withdrawalReasonTouched.set(false);
  }

  updatePersonnelUser(userId: string): void {
    this.personnelForm.set({ ...this.personnelForm(), user_id: userId });
    this.pageError.set('');
  }

  updatePersonnelReason(reason: string): void {
    this.personnelForm.set({ ...this.personnelForm(), reason });
    this.pageError.set('');
  }

  markPersonnelFieldAsTouched(field: 'user_id' | 'reason'): void {
    this.personnelTouchedFields.update((fields) => new Set([...fields, field]));
  }

  personnelFieldError(field: 'user_id' | 'reason'): string | null {
    const form = this.personnelForm();
    const touched = this.personnelTouchedFields().has(field);

    if (field === 'user_id' && touched && !form.user_id) return 'Selecciona una persona.';
    if (field === 'reason' && (touched || Boolean(form.user_id)) && !form.reason.trim()) {
      return 'El motivo de asignación es obligatorio.';
    }

    return null;
  }

  updateWithdrawalReason(reason: string): void {
    this.withdrawalReason.set(reason);
    this.pageError.set('');
  }

  markWithdrawalReasonAsTouched(): void {
    this.withdrawalReasonTouched.set(true);
  }

  withdrawalReasonError(): string | null {
    return this.withdrawalReasonTouched() && !this.withdrawalReason().trim()
      ? 'El motivo del retiro es obligatorio.'
      : null;
  }

  async confirmWithdrawal(): Promise<void> {
    const pending = this.pendingWithdrawal();
    const reason = this.withdrawalReason().trim();
    if (!pending || !reason) {
      this.markWithdrawalReasonAsTouched();
      return;
    }

    await this.runAction(async () => {
      if (pending.type === 'personnel') {
        await firstValueFrom(this.api.endPersonnelAssignment(
          pending.assignment.user.id,
          pending.assignment.assignment_id,
          reason,
        ));
      } else {
        await firstValueFrom(this.api.terminateCoordinatorDistributorAssignment(pending.assignment.id, reason));
      }
      this.closeWithdrawalDialog();
      this.alerts.success('La asignación se retiró sin borrar el historial.');
    });
  }

  distributorLabel(distributor: DistributorCandidate): string {
    return `${distributor.distributor_number} · ${distributor.applicant?.full_name || 'Distribuidora sin nombre capturado'}`;
  }

  roleLabel(user: UserRes): string {
    return organizationalRole(user)?.name ?? 'Sin rol organizacional';
  }

  private async runAction(action: () => Promise<void>): Promise<void> {
    if (this.actionLoading()) return;
    this.actionLoading.set(true);
    this.pageError.set('');
    this.pageMessage.set('');
    try {
      await action();
      await this.reload();
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible completar la asignación.'));
    } finally {
      this.actionLoading.set(false);
    }
  }

  private hasPermission(permission: string): boolean {
    const permissions = this.session.permissions();
    return permissions.includes(permission) || permissions.includes('all');
  }
}
