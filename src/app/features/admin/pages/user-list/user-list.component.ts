import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage, apiValidationErrors, ValidationErrorsByField } from '../../../../core/api/api-error';
import { SessionStore } from '../../../../core/session/session.store';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../../shared/ui/status-badge/status-badge.component';
import { ViewStateComponent } from '../../../../shared/ui/view-state/view-state.component';
import { LucideAngularModule } from 'lucide-angular';
import { Branch } from '../../../organization/data-access/organization.dtos';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import { RoleRes, UserRes, UserState } from '../../data-access/admin.dtos';
import { RoleService } from '../../data-access/role.service';
import { UserService } from '../../data-access/user.service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule, RouterLink, PageHeaderComponent, StatusBadgeComponent, ViewStateComponent, LucideAngularModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly organizationApi = inject(OrganizationApiService);
  private readonly sessionStore = inject(SessionStore);

  readonly users = signal<UserRes[]>([]);
  readonly totalUsers = signal(0);
  readonly loading = signal(false);
  readonly pageError = signal('');
  readonly pageMessage = signal('');
  readonly filterStatus = signal<UserState | ''>('');
  readonly filterRole = signal('');
  readonly filterBranch = signal('');
  readonly filterSearch = signal('');
  readonly page = signal(1);
  readonly isActionLoading = signal<string | null>(null);
  readonly activeTab = signal<'directory' | 'roles'>('directory');

  readonly showInviteModal = signal(false);
  readonly inviteName = signal('');
  readonly inviteEmail = signal('');
  readonly inviteRoleId = signal('');
  readonly inviteBranchId = signal('');
  readonly inviteError = signal('');
  readonly inviteValidationErrors = signal<ValidationErrorsByField>({});
  readonly availableRoles = signal<RoleRes[]>([]);
  readonly assignableRoles = signal<RoleRes[]>([]);
  readonly availableBranches = signal<Branch[]>([]);
  readonly userToBlock = signal<UserRes | null>(null);

  readonly selectedInviteRole = computed(
    () => this.assignableRoles().find((role) => role.id === this.inviteRoleId()) ?? null,
  );
  readonly inviteRequiresBranch = computed(() => {
    const role = this.selectedInviteRole();
    return role ? role.default_scope !== 'GLOBAL' : false;
  });
  readonly inviteIsValid = computed(() => {
    const name = this.inviteName().trim();
    const branchValid = !this.inviteRequiresBranch() || Boolean(this.inviteBranchId());
    return name.length > 0 && name.length <= 255 && EMAIL_PATTERN.test(this.inviteEmail().trim())
      && Boolean(this.inviteRoleId()) && branchValid;
  });

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
    if (this.canViewRoles()) await this.loadRoles();
    if (this.canInviteUsers()) await this.loadAssignableRoles();
    if (this.hasPermission('branches.view')) await this.loadBranches();
  }

  ngOnDestroy(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  canViewRoles(): boolean {
    return this.hasPermission('roles.view');
  }

  canInviteUsers(): boolean {
    return this.hasPermission('users.create') && this.canViewRoles();
  }

  canManageUserState(): boolean {
    return this.hasPermission('users.manage_state');
  }

  async loadRoles(): Promise<void> {
    try {
      const roles = await firstValueFrom(this.roleService.getRoles());
      this.availableRoles.set(roles.filter((role) => role.is_active !== false && role.code !== 'distributor'));
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cargar los roles disponibles.'));
    }
  }

  async loadAssignableRoles(): Promise<void> {
    try {
      const roles = await firstValueFrom(this.roleService.getAssignableRoles());
      this.assignableRoles.set(roles);
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cargar los roles asignables.'));
    }
  }

  async loadBranches(): Promise<void> {
    try {
      const response = await firstValueFrom(this.organizationApi.getBranches({ per_page: 100 }));
      this.availableBranches.set(response.data.filter((branch) => branch.status === 'ACTIVE'));
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cargar las sucursales disponibles.'));
    }
  }

  async loadUsers(): Promise<void> {
    this.loading.set(true);
    this.pageError.set('');
    try {
      const response = await firstValueFrom(this.userService.getUsers({
        search: this.filterSearch().trim() || undefined,
        state: this.filterStatus() || undefined,
        role_id: this.filterRole() || undefined,
        branch_id: this.filterBranch() || undefined,
        page: this.page(),
      }));
      this.users.set(response.data);
      this.totalUsers.set(response.total);
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cargar los usuarios.'));
    } finally {
      this.loading.set(false);
    }
  }

  onFilterChange(debounce = false): void {
    this.page.set(1);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (debounce) {
      this.searchTimer = setTimeout(() => void this.loadUsers(), 300);
      return;
    }
    void this.loadUsers();
  }

  readonly isFetchingEligibleBranches = signal(false);
  readonly eligibleBranchesForManager = signal<Branch[]>([]);

  readonly currentInviteBranches = computed(() => {
    const role = this.selectedInviteRole();
    if (role?.code === 'branch_manager') {
      return this.eligibleBranchesForManager().filter((branch) => !branch.is_headquarters);
    }
    return this.availableBranches();
  });

  async onInviteRoleChange(roleId: string): Promise<void> {
    this.inviteRoleId.set(roleId);
    this.inviteBranchId.set('');
    
    const role = this.selectedInviteRole();
    if (role?.code === 'branch_manager') {
        this.isFetchingEligibleBranches.set(true);
        try {
            const response = await firstValueFrom(this.organizationApi.getBranches({ 
                per_page: 100,
                eligible_for_manager: true
            } as any));
            this.eligibleBranchesForManager.set(response.data);
        } catch (error: unknown) {
            this.inviteError.set('No se pudieron cargar las sucursales elegibles.');
        } finally {
            this.isFetchingEligibleBranches.set(false);
        }
    }
  }

  closeInviteModal(): void {
    this.showInviteModal.set(false);
    this.inviteName.set('');
    this.inviteEmail.set('');
    this.inviteRoleId.set('');
    this.inviteBranchId.set('');
    this.inviteError.set('');
    this.inviteValidationErrors.set({});
  }

  async inviteUser(): Promise<void> {
    if (!this.inviteIsValid() || this.isActionLoading()) {
      this.inviteError.set('Complete nombre, correo, rol y el alcance requerido con datos válidos.');
      return;
    }

    this.isActionLoading.set('invite');
    this.inviteError.set('');
    this.inviteValidationErrors.set({});
    try {
      const response = await firstValueFrom(this.userService.createAccount({
        name: this.inviteName().trim(),
        email: this.inviteEmail().trim().toLowerCase(),
        role_id: this.inviteRoleId(),
        branch_id: this.inviteBranchId() || null,
        send_invitation: true,
      }));
      this.closeInviteModal();
      await this.loadUsers();
      this.pageMessage.set(response.message);
    } catch (error: unknown) {
      this.inviteError.set(apiErrorMessage(error, 'No fue posible crear y enviar la invitación.'));
      this.inviteValidationErrors.set(apiValidationErrors(error));
    } finally {
      this.isActionLoading.set(null);
    }
  }

  openBlockModal(user: UserRes): void {
    this.userToBlock.set(user);
  }

  closeBlockModal(): void {
    this.userToBlock.set(null);
  }

  async confirmBlock(): Promise<void> {
    const user = this.userToBlock();
    if (!user || this.isActionLoading()) return;

    this.isActionLoading.set(`block-${user.id}`);
    this.pageError.set('');
    try {
      const request = user.state === 'BLOCKED'
        ? this.userService.unblockUser(user.id)
        : this.userService.blockUser(user.id);
      await firstValueFrom(request);
      this.closeBlockModal();
      await this.loadUsers();
    } catch (error: unknown) {
      this.pageError.set(apiErrorMessage(error, 'No fue posible cambiar el estado del usuario.'));
    } finally {
      this.isActionLoading.set(null);
    }
  }

  stateLabel(state: UserState): string {
    return ({
      ACTIVE: 'Activo',
      INVITED: 'Invitado',
      PENDING_ACTIVATION: 'Pendiente de activación',
      BLOCKED: 'Bloqueado',
      DISABLED: 'Deshabilitado',
    } satisfies Record<UserState, string>)[state];
  }

  stateTone(state: UserState): StatusBadgeTone {
    return ({
      ACTIVE: 'success',
      INVITED: 'info',
      PENDING_ACTIVATION: 'warning',
      BLOCKED: 'danger',
      DISABLED: 'neutral',
    } satisfies Record<UserState, StatusBadgeTone>)[state];
  }

  private hasPermission(permission: string): boolean {
    const permissions = this.sessionStore.permissions();
    return permissions.includes(permission) || permissions.includes('all');
  }
}
