import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '@core/api/api-error';
import { SessionStore } from '@core/session/session.store';
import { RoleScopeRes, UserRes } from '../../../admin/data-access/admin.dtos';
import { UserService } from '../../../admin/data-access/user.service';
import { OrganizationApiService } from '../../data-access/organization-api.service';
import {
  Branch,
  CoordinatorDistributorAssignment,
  DistributorCandidate,
  PersonnelAssignment,
} from '../../data-access/organization.dtos';

@Component({
  selector: 'app-organization-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './assignments.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentsPage implements OnInit {
  private readonly api = inject(OrganizationApiService);
  private readonly userService = inject(UserService);
  private readonly session = inject(SessionStore);

  readonly branches = signal<Branch[]>([]);
  readonly users = signal<UserRes[]>([]);
  readonly personnel = signal<PersonnelAssignment[]>([]);
  readonly distributorAssignments = signal<CoordinatorDistributorAssignment[]>([]);
  readonly distributors = signal<DistributorCandidate[]>([]);
  readonly selectedBranch = signal<Branch | null>(null);
  readonly activeTab = signal<'personnel' | 'distributors'>('personnel');
  readonly isLoading = signal(false);
  readonly actionLoading = signal(false);
  readonly pageError = signal('');
  readonly pageMessage = signal('');
  readonly personnelForm = signal({ user_id: '', reason: '' });
  readonly distributorForm = signal({ distributor_id: '', coordinator_id: '', reason: '' });

  readonly eligibleUsers = computed(() => this.users().filter((user) =>
    user.state === 'ACTIVE' && this.organizationalRole(user) !== null,
  ));
  readonly selectedPersonnelRole = computed(() => {
    const user = this.users().find((item) => item.id === this.personnelForm().user_id);
    return user ? this.organizationalRole(user) : null;
  });
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
    this.pageMessage.set('');
    await this.reload();
  }

  showBranches(): void {
    this.selectedBranch.set(null);
    this.personnel.set([]);
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
      const [personnel, coordinatorAssignments, distributors] = await Promise.all([
        firstValueFrom(this.api.getBranchAssignments(branch.id)),
        firstValueFrom(this.api.getCoordinatorDistributorAssignments(branch.id)),
        firstValueFrom(this.api.getActiveDistributorCandidates(branch.id)),
      ]);
      this.personnel.set(personnel.data);
      this.distributorAssignments.set(coordinatorAssignments);
      this.distributors.set(distributors);
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cargar las asignaciones de la sucursal.'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async assignPersonnel(): Promise<void> {
    const branch = this.selectedBranch();
    const form = this.personnelForm();
    const role = this.selectedPersonnelRole();
    const roleId = role?.role.id;
    if (!branch || !form.user_id || !roleId || !form.reason.trim()) {
      this.pageError.set('Seleccione una persona con rol organizacional y capture el motivo.');
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
      this.pageMessage.set('El personal quedó asignado con el rol que ya tiene registrado.');
    });
  }

  async endPersonnel(assignment: PersonnelAssignment): Promise<void> {
    const reason = window.prompt('Motivo del retiro de la asignación:')?.trim();
    if (!reason) return;

    await this.runAction(async () => {
      await firstValueFrom(this.api.endPersonnelAssignment(assignment.user.id, assignment.assignment_id, reason));
      this.pageMessage.set('La asignación se retiró sin borrar el historial.');
    });
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

  async endDistributor(assignment: CoordinatorDistributorAssignment): Promise<void> {
    if (assignment.distributor?.status === 'ACTIVE') {
      this.pageError.set('Una distribuidora activa debe reasignarse; no puede quedar sin coordinador.');
      return;
    }
    const reason = window.prompt('Motivo del retiro de la asignación:')?.trim();
    if (!reason) return;

    await this.runAction(async () => {
      await firstValueFrom(this.api.terminateCoordinatorDistributorAssignment(assignment.id, reason));
      this.pageMessage.set('La asignación se retiró sin borrar el historial.');
    });
  }

  distributorLabel(distributor: DistributorCandidate): string {
    return `${distributor.distributor_number} · ${distributor.applicant?.full_name || 'Distribuidora sin nombre capturado'}`;
  }

  roleLabel(user: UserRes): string {
    return this.organizationalRole(user)?.role.name ?? 'Sin rol organizacional';
  }

  private organizationalRole(user: UserRes): RoleScopeRes | null {
    const allowed = new Set(['branch_manager', 'coordinator', 'verifier', 'cashier']);
    return user.role_scopes?.find((scope) => scope.role.code && allowed.has(scope.role.code)) ?? null;
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
