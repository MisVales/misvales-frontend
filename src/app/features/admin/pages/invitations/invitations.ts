import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { RoleRes } from '../../data-access/admin.dtos';
import { InvitationRes, InvitationService } from '../../data-access/invitation.service';
import { RoleService } from '../../data-access/role.service';
import { OrganizationFacade } from '../../../organization/state/organization.facade';
import { ReasonActionDialogComponent } from '../../../../shared/ui/reason-action-dialog/reason-action-dialog.component';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DatePipe, ReasonActionDialogComponent],
  templateUrl: './invitations.html',
})
export class Invitations implements OnInit {
  private readonly invitationService = inject(InvitationService);
  private readonly roleService = inject(RoleService);
  readonly organizationFacade = inject(OrganizationFacade);

  readonly invitations = signal<InvitationRes[]>([]);
  readonly roles = signal<RoleRes[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  readonly totalItems = signal(0);
  readonly filterState = signal<string>(''); // empty means all
  
  readonly isModalOpen = signal(false);
  readonly isSubmitting = signal(false);
  readonly formTouched = signal(false);
  readonly newInvitation = signal({ name: '', email: '', role_id: '', branch_id: '' });

  readonly isNameValid = computed(() => !!this.newInvitation().name.trim());
  readonly isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newInvitation().email.trim()));
  readonly isBranchValid = computed(() => !this.isBranchRequired() || !!this.newInvitation().branch_id);

  // Revocation modal state
  readonly isRevokeModalOpen = signal(false);
  readonly invitationToRevoke = signal<InvitationRes | null>(null);
  readonly revokeReason = signal('');

  readonly filteredBranches = computed(() => {
    const roleId = this.newInvitation().role_id;
    const branches = this.organizationFacade.branches().filter((branch) => branch.status === 'ACTIVE');

    if (!roleId) return branches;

    const selectedRole = this.roles().find((r) => r.id === roleId);
    if (selectedRole) {
      if (selectedRole.code === 'branch_manager') {
        return branches.filter((b) => !b.is_headquarters && !b.has_branch_manager);
      }
    }

    return branches;
  });

  readonly isBranchRequired = computed(() => {
    const roleId = this.newInvitation().role_id;
    if (!roleId) return true;

    const selectedRole = this.roles().find((r) => r.id === roleId);
    if (selectedRole && (selectedRole.code === 'admin' || selectedRole.code === 'system_admin')) {
      return false;
    }
    return true;
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadInvitations(),
      this.loadRoles(),
      this.organizationFacade.loadBranches(1, 100, undefined, 'ACTIVE'),
    ]);
  }

  async loadRoles(): Promise<void> {
    try {
      const roles = await firstValueFrom(this.roleService.getRoles());
      this.roles.set(
        roles.filter((role) => role.is_active !== false && role.code !== 'general_manager'),
      );
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible cargar los roles.'));
    }
  }

  async loadInvitations(page = 1): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const state = this.filterState();
      const response = await firstValueFrom(this.invitationService.getInvitations(page, state || undefined));
      this.invitations.set(response.data);
      this.currentPage.set(response.current_page);
      this.lastPage.set(response.last_page ?? 1);
      this.totalItems.set(response.total ?? 0);
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible cargar las invitaciones.'));
    } finally {
      this.loading.set(false);
    }
  }

  onFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filterState.set(value);
    this.loadInvitations(1);
  }

  async setPage(page: number): Promise<void> {
    if (page >= 1 && page <= this.lastPage()) await this.loadInvitations(page);
  }

  openModal(): void {
    this.newInvitation.set({ name: '', email: '', role_id: '', branch_id: '' });
    this.error.set('');
    this.formTouched.set(false);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.formTouched.set(false);
  }

  onRoleChange(roleId: string): void {
    const currentData = this.newInvitation();
    this.newInvitation.set({ ...currentData, role_id: roleId });

    if (currentData.branch_id) {
      const availableBranchIds = this.filteredBranches().map((b) => b.id);
      if (!availableBranchIds.includes(currentData.branch_id) || !this.isBranchRequired()) {
        this.newInvitation.set({ ...this.newInvitation(), branch_id: '' });
      }
    }
  }

  async submitInvitation(): Promise<void> {
    this.formTouched.set(true);
    const data = this.newInvitation();
    if (!this.isNameValid() || !this.isEmailValid() || !this.isBranchValid()) {
      return;
    }

    if (!this.isBranchRequired()) {
      data.branch_id = '';
    }

    if (data.branch_id && data.role_id) {
      const selectedRole = this.roles().find((r) => r.id === data.role_id);
      const selectedBranch = this.organizationFacade
        .branches()
        .find((b) => b.id === data.branch_id);

      if (selectedRole && selectedBranch?.is_headquarters) {
        const globalRoles = ['admin', 'system_admin', 'general_manager'];
        if (!globalRoles.includes(selectedRole.code)) {
          this.error.set(
            'Solo el Gerente General y los Administradores tienen alcance global. Los gerentes y personal de sucursal deben asignarse a una sucursal específica.',
          );
          return;
        }
      }
    }

    this.isSubmitting.set(true);
    this.error.set('');
    this.success.set('');
    try {
      const response = await firstValueFrom(
        this.invitationService.sendInvitation({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          role_id: data.role_id || undefined,
          branch_id: data.branch_id || null,
          send_invitation: true,
        }),
      );
      this.closeModal();
      await this.loadInvitations(1);
      this.success.set(response.message);
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible enviar la invitación.'));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  openRevokeModal(invitation: InvitationRes): void {
    this.invitationToRevoke.set(invitation);
    this.revokeReason.set('');
    this.isRevokeModalOpen.set(true);
  }

  closeRevokeModal(): void {
    this.isRevokeModalOpen.set(false);
    this.invitationToRevoke.set(null);
  }

  async confirmRevoke(): Promise<void> {
    const invitation = this.invitationToRevoke();
    const reason = this.revokeReason().trim();
    if (!invitation || !reason) return;

    this.isSubmitting.set(true);
    try {
      await firstValueFrom(this.invitationService.revokeInvitation(invitation.id, reason));
      this.success.set('La invitación ha sido revocada exitosamente.');
      this.closeRevokeModal();
      await this.loadInvitations(this.currentPage());
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible revocar la invitación.'));
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
