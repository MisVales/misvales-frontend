import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { InvitationService, InvitationRes } from '../../data-access/invitation.service';
import { RoleService } from '../../data-access/role.service';
import { RoleRes } from '../../data-access/admin.dtos';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DatePipe],
  templateUrl: './invitations.html',
})
export class Invitations implements OnInit {
  private invitationService = inject(InvitationService);
  private roleService = inject(RoleService);

  invitations = signal<InvitationRes[]>([]);
  roles = signal<RoleRes[]>([]);
  loading = signal(true);
  error = signal('');
  
  currentPage = signal(1);
  lastPage = signal(1);
  totalItems = signal(0);

  // Create form state
  isModalOpen = signal(false);
  isSubmitting = signal(false);
  newInvitation = signal({
    name: '',
    email: '',
    role_id: '',
    branch_id: ''
  });

  async ngOnInit() {
    await Promise.all([
      this.loadInvitations(),
      this.loadRoles()
    ]);
  }

  async loadRoles() {
    try {
      const rolesRes = await firstValueFrom(this.roleService.getRoles());
      this.roles.set(rolesRes.filter(r => r.name.toLowerCase() !== 'gerente general' && r.id !== 'gerente_general'));
    } catch (e) {
      console.error('Error loading roles', e);
    }
  }

  async loadInvitations(page: number = 1) {
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await firstValueFrom(
        this.invitationService.getInvitations(page)
      );
      this.invitations.set(response.data);
      this.currentPage.set(response.current_page);
      this.lastPage.set(response.last_page || 1);
      this.totalItems.set(response.total || 0);
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al cargar invitaciones.');
    } finally {
      this.loading.set(false);
    }
  }

  async setPage(page: number) {
    if (page >= 1 && page <= this.lastPage()) {
      await this.loadInvitations(page);
    }
  }

  openModal() {
    this.newInvitation.set({ name: '', email: '', role_id: '', branch_id: '' });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  async submitInvitation() {
    const data = this.newInvitation();
    if (!data.name || !data.email) {
      alert('Por favor, completa al menos el nombre y correo electrónico.');
      return;
    }

    this.isSubmitting.set(true);
    try {
      // 403 con mfa_required abrirá el modal de MFA interceptado, luego se re-ejecuta
      await firstValueFrom(
        this.invitationService.sendInvitation({
          name: data.name,
          email: data.email,
          role_id: data.role_id || undefined,
          branch_id: data.branch_id || null,
          send_invitation: true
        })
      );
      this.closeModal();
      await this.loadInvitations(1);
    } catch (err: any) {
      alert(err.error?.message || 'Error al enviar la invitación.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
