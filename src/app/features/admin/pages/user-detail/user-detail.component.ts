import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../data-access/user.service';
import { UserRes, UserAssignmentRes, RoleRes } from '../../data-access/admin.dtos';
import { RoleService } from '../../data-access/role.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  
  userId = signal<string | null>(null);
  user = signal<UserRes | null>(null);
  assignments = signal<UserAssignmentRes[]>([]);
  availableRoles = signal<RoleRes[]>([]);
  
  // Modals state
  isBlockModalOpen = signal(false);
  isDisableModalOpen = signal(false);
  isAssignModalOpen = signal(false);
  isActionLoading = signal<string | null>(null);

  // Assign Form
  newAssignment = signal({
    role_id: '',
    branch_id: ''
  });

  constructor() {
    this.userId.set(this.route.snapshot.paramMap.get('id'));
  }

  async ngOnInit() {
    this.loadUser();
    this.loadRoles();
    this.loadAssignments();
  }

  loadUser() {
    const id = this.userId();
    if (!id) return;
    this.userService.getUser(id).subscribe({
      next: (res) => this.user.set(res),
      error: (err) => console.error(err)
    });
  }

  async loadRoles() {
    try {
      const roles = await firstValueFrom(this.roleService.getRoles());
      this.availableRoles.set(roles.filter(r => r.name.toLowerCase() !== 'gerente general' && r.id !== 'gerente_general'));
    } catch (e) {
      console.error(e);
    }
  }

  async loadAssignments() {
    const id = this.userId();
    if (!id) return;
    try {
      const data = await firstValueFrom(this.userService.getAssignments(id));
      this.assignments.set(data);
    } catch (e) {
      console.error(e);
    }
  }

  openBlockModal() {
    this.isBlockModalOpen.set(true);
  }

  closeBlockModal() {
    this.isBlockModalOpen.set(false);
  }

  confirmBlock() {
    const id = this.userId();
    const u = this.user();
    if (!id || !u) return;

    this.isActionLoading.set('block');
    const req = u.state === 'BLOCKED' ? this.userService.unblockUser(id) : this.userService.blockUser(id);
    
    req.subscribe({
      next: () => {
        this.isActionLoading.set(null);
        this.closeBlockModal();
        this.loadUser();
      },
      error: (err) => {
        console.error(err);
        this.isActionLoading.set(null);
        alert('Error al cambiar el estado de bloqueo');
      }
    });
  }

  openDisableModal() {
    this.isDisableModalOpen.set(true);
  }

  closeDisableModal() {
    this.isDisableModalOpen.set(false);
  }

  confirmDisable() {
    const id = this.userId();
    const u = this.user();
    if (!id || !u) return;

    this.isActionLoading.set('disable');
    const request = u.state === 'DISABLED' 
      ? this.userService.enableUser(id)
      : this.userService.disableUser(id);

    request.subscribe({
      next: () => {
        this.isActionLoading.set(null);
        this.closeDisableModal();
        this.loadUser();
      },
      error: (err) => {
        console.error(err);
        this.isActionLoading.set(null);
      }
    });
  }

  forcePasswordChange() {
    const id = this.userId();
    if (!id) return;

    if (confirm('¿Exigir al usuario que cambie su contraseña en el próximo inicio de sesión?')) {
      this.userService.requirePasswordChange(id).subscribe({
        next: () => alert('Solicitud de cambio de contraseña configurada exitosamente.'),
        error: (err) => console.error(err)
      });
    }
  }

  resendInvitation() {
    const id = this.userId();
    if (!id) return;

    if (confirm('¿Reenviar el correo de invitación a este usuario?')) {
      this.isActionLoading.set('resend');
      this.userService.sendInvitation(id).subscribe({
        next: () => {
          this.isActionLoading.set(null);
          alert('Invitación reenviada correctamente.');
        },
        error: (err) => {
          console.error(err);
          this.isActionLoading.set(null);
          alert('Error al reenviar la invitación.');
        }
      });
    }
  }

  openAssignModal() {
    this.newAssignment.set({ role_id: '', branch_id: '' });
    this.isAssignModalOpen.set(true);
  }

  closeAssignModal() {
    this.isAssignModalOpen.set(false);
  }

  async submitAssignment() {
    const id = this.userId();
    const assignment = this.newAssignment();
    if (!id || !assignment.role_id) return;

    this.isActionLoading.set('assign');
    try {
      await firstValueFrom(
        this.userService.assignRole(id, {
          role_id: assignment.role_id,
          branch_id: assignment.branch_id || null
        })
      );
      this.closeAssignModal();
      await this.loadAssignments();
    } catch (e: any) {
      alert(e.error?.message || 'Error asignando rol');
    } finally {
      this.isActionLoading.set(null);
    }
  }

  async revokeAssignment(assignmentId: string) {
    const id = this.userId();
    if (!id) return;

    if (confirm('¿Seguro que quieres revocar este rol?')) {
      this.isActionLoading.set(`revoke-${assignmentId}`);
      try {
        await firstValueFrom(this.userService.revokeRole(id, assignmentId));
        await this.loadAssignments();
      } catch (e: any) {
        alert(e.error?.message || 'Error revocando rol');
      } finally {
        this.isActionLoading.set(null);
      }
    }
  }
}
