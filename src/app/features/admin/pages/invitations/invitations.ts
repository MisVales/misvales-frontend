import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { RoleRes } from '../../data-access/admin.dtos';
import { InvitationRes, InvitationService } from '../../data-access/invitation.service';
import { RoleService } from '../../data-access/role.service';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DatePipe],
  templateUrl: './invitations.html',
})
export class Invitations implements OnInit {
  private readonly invitationService = inject(InvitationService);
  private readonly roleService = inject(RoleService);

  readonly invitations = signal<InvitationRes[]>([]);
  readonly roles = signal<RoleRes[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  readonly totalItems = signal(0);
  readonly isModalOpen = signal(false);
  readonly isSubmitting = signal(false);
  readonly newInvitation = signal({ name: '', email: '', role_id: '', branch_id: '' });

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadInvitations(), this.loadRoles()]);
  }

  async loadRoles(): Promise<void> {
    try {
      const roles = await firstValueFrom(this.roleService.getRoles());
      this.roles.set(roles.filter((role) => role.is_active !== false && role.code !== 'general_manager'));
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible cargar los roles.'));
    }
  }

  async loadInvitations(page = 1): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await firstValueFrom(this.invitationService.getInvitations(page));
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

  async setPage(page: number): Promise<void> {
    if (page >= 1 && page <= this.lastPage()) await this.loadInvitations(page);
  }

  openModal(): void {
    this.newInvitation.set({ name: '', email: '', role_id: '', branch_id: '' });
    this.error.set('');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  async submitInvitation(): Promise<void> {
    const data = this.newInvitation();
    if (!data.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      this.error.set('Ingrese un nombre y un correo electrónico válidos.');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');
    this.success.set('');
    try {
      const response = await firstValueFrom(this.invitationService.sendInvitation({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role_id: data.role_id || undefined,
        branch_id: data.branch_id || null,
        send_invitation: true,
      }));
      this.closeModal();
      await this.loadInvitations(1);
      this.success.set(response.message);
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible enviar la invitación.'));
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
