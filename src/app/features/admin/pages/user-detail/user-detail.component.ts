import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { SessionStore } from '../../../../core/session/session.store';
import { Branch } from '../../../organization/data-access/organization.dtos';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import { RoleRes, UserAssignmentRes, UserRes } from '../../data-access/admin.dtos';
import { RoleService } from '../../data-access/role.service';
import { UserService } from '../../data-access/user.service';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent, StatusLabelPipe],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly organizationApi = inject(OrganizationApiService);
  private readonly sessionStore = inject(SessionStore);

  readonly userId = signal(this.route.snapshot.paramMap.get('id'));
  readonly user = signal<UserRes | null>(null);
  readonly assignments = signal<UserAssignmentRes[]>([]);
  readonly availableRoles = signal<RoleRes[]>([]);
  readonly availableBranches = signal<Branch[]>([]);
  readonly pageError = signal('');
  readonly pageMessage = signal('');
  readonly isBlockModalOpen = signal(false);
  readonly isDisableModalOpen = signal(false);
  readonly isAssignModalOpen = signal(false);
  readonly assignFormTouched = signal(false);
  readonly isActionLoading = signal<string | null>(null);
  readonly newAssignment = signal({ role_id: '', branch_id: '' });
  readonly assignmentToRevoke = signal<string | null>(null);

  readonly selectedAssignmentRole = computed(
    () => this.availableRoles().find((role) => role.id === this.newAssignment().role_id) ?? null,
  );
  readonly assignmentRequiresBranch = computed(() => {
    const role = this.selectedAssignmentRole();
    return role ? role.default_scope !== 'GLOBAL' : false;
  });

  async ngOnInit(): Promise<void> {
    await this.loadUser();
    if (this.canViewRoles()) await this.loadRoles();
    if (this.canViewAssignments()) await this.loadAssignments();
    if (this.hasPermission('branches.view')) await this.loadBranches();
  }

  canViewRoles(): boolean {
    return this.hasPermission('roles.view');
  }

  canViewAssignments(): boolean {
    return this.hasPermission('roles.assign') || this.hasPermission('branches.view');
  }

  canAssignRoles(): boolean {
    return this.hasPermission('roles.assign') && this.canViewRoles();
  }

  canManageUserState(): boolean {
    return this.hasPermission('users.manage_state');
  }

  async loadUser(): Promise<void> {
    const id = this.userId();
    if (!id) return;
    try {
      this.user.set(await firstValueFrom(this.userService.getUser(id)));
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cargar el usuario.'));
    }
  }

  async loadRoles(): Promise<void> {
    try {
      const roles = await firstValueFrom(this.roleService.getRoles());
      this.availableRoles.set(roles.filter((role) => role.is_active !== false && role.code !== 'general_manager'));
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cargar los roles.'));
    }
  }

  async loadBranches(): Promise<void> {
    try {
      const response = await firstValueFrom(this.organizationApi.getBranches({ per_page: 100 }));
      this.availableBranches.set(response.data.filter((branch) => branch.status === 'ACTIVE'));
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cargar las sucursales.'));
    }
  }

  async loadAssignments(): Promise<void> {
    const id = this.userId();
    if (!id) return;
    try {
      this.assignments.set(await firstValueFrom(this.userService.getAssignments(id)));
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cargar las asignaciones.'));
    }
  }

  openBlockModal(): void { this.isBlockModalOpen.set(true); }
  closeBlockModal(): void { this.isBlockModalOpen.set(false); }
  openDisableModal(): void { this.isDisableModalOpen.set(true); }
  closeDisableModal(): void { this.isDisableModalOpen.set(false); }

  async confirmBlock(): Promise<void> {
    const id = this.userId();
    const currentUser = this.user();
    if (!id || !currentUser || this.isActionLoading()) return;

    this.isActionLoading.set('block');
    this.pageError.set('');
    try {
      const request = currentUser.state === 'BLOCKED'
        ? this.userService.unblockUser(id)
        : this.userService.blockUser(id);
      const response = await firstValueFrom(request);
      this.pageMessage.set(response.message);
      this.closeBlockModal();
      await this.loadUser();
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cambiar el estado de bloqueo.'));
    } finally {
      this.isActionLoading.set(null);
    }
  }

  async confirmDisable(): Promise<void> {
    const id = this.userId();
    const currentUser = this.user();
    if (!id || !currentUser || this.isActionLoading()) return;

    this.isActionLoading.set('disable');
    this.pageError.set('');
    try {
      const request = currentUser.state === 'DISABLED'
        ? this.userService.enableUser(id)
        : this.userService.disableUser(id);
      const response = await firstValueFrom(request);
      this.pageMessage.set(response.message);
      this.closeDisableModal();
      await this.loadUser();
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cambiar el estado del usuario.'));
    } finally {
      this.isActionLoading.set(null);
    }
  }

  openAssignModal(): void {
    this.newAssignment.set({ role_id: '', branch_id: '' });
    this.assignFormTouched.set(false);
    this.isAssignModalOpen.set(true);
  }

  closeAssignModal(): void {
    this.assignFormTouched.set(false);
    this.isAssignModalOpen.set(false);
  }

  onAssignmentRoleChange(roleId: string): void {
    this.newAssignment.set({ role_id: roleId, branch_id: '' });
  }

  async submitAssignment(): Promise<void> {
    this.assignFormTouched.set(true);
    const id = this.userId();
    const assignment = this.newAssignment();
    if (!id || !assignment.role_id || (this.assignmentRequiresBranch() && !assignment.branch_id)) {
      return;
    }

    this.isActionLoading.set('assign');
    try {
      const response = await firstValueFrom(this.userService.assignRole(id, {
        role_id: assignment.role_id,
        branch_id: assignment.branch_id || null,
      }));
      this.pageMessage.set(response.message);
      this.closeAssignModal();
      await this.loadAssignments();
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible asignar el rol.'));
    } finally {
      this.isActionLoading.set(null);
    }
  }

  requestRevokeAssignment(assignmentId: string): void {
    this.assignmentToRevoke.set(assignmentId);
  }

  cancelRevokeAssignment(): void {
    this.assignmentToRevoke.set(null);
  }

  async confirmRevokeAssignment(): Promise<void> {
    const id = this.userId();
    const assignmentId = this.assignmentToRevoke();
    if (!id || !assignmentId) return;

    this.isActionLoading.set(`revoke-${assignmentId}`);
    try {
      const response = await firstValueFrom(this.userService.revokeRole(id, assignmentId));
      this.pageMessage.set(response.message);
      this.cancelRevokeAssignment();
      await this.loadAssignments();
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible revocar el rol.'));
    } finally {
      this.isActionLoading.set(null);
    }
  }

  private hasPermission(permission: string): boolean {
    const permissions = this.sessionStore.permissions();
    return permissions.includes(permission) || permissions.includes('all');
  }
}
