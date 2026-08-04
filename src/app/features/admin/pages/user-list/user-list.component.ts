import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserRes } from '../../data-access/admin.dtos';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  users = signal<UserRes[]>([
    { id: '1', name: 'Juan Perez', email: 'juan@example.com', status: 'active', roles: ['admin'], branchId: 'suc-1' },
    { id: '2', name: 'Maria Lopez', email: 'maria@example.com', status: 'invited', roles: ['gerente'], branchId: 'suc-2' },
    { id: '3', name: 'Carlos Slim', email: 'carlos@example.com', status: 'blocked', roles: ['cajero'], branchId: 'suc-1' },
  ]);

  filterStatus = signal<string>('');
  filterRole = signal<string>('');

  filteredUsers = computed(() => {
    return this.users().filter(u => {
      const matchStatus = !this.filterStatus() || u.status === this.filterStatus();
      const matchRole = !this.filterRole() || u.roles.includes(this.filterRole());
      return matchStatus && matchRole;
    });
  });

  isActionLoading = signal<string | null>(null);

  // Modal State for Inviting
  showInviteModal = signal(false);
  inviteEmail = signal('');

  inviteUser() {
    if (!this.inviteEmail()) return;
    this.isActionLoading.set('invite');
    setTimeout(() => {
      this.isActionLoading.set(null);
      this.showInviteModal.set(false);
      alert(`Invitación enviada a ${this.inviteEmail()}`);
      this.inviteEmail.set('');
    }, 1500);
  }

  userToBlock = signal<UserRes | null>(null);

  openBlockModal(user: UserRes) {
    this.userToBlock.set(user);
  }

  closeBlockModal() {
    this.userToBlock.set(null);
  }

  confirmBlock() {
    const user = this.userToBlock();
    if (!user) return;
    this.closeBlockModal();
    
    this.isActionLoading.set(`block-${user.id}`);
    setTimeout(() => {
      this.users.update(list => list.map(u => {
        if (u.id === user.id) {
          return { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' };
        }
        return u;
      }));
      this.isActionLoading.set(null);
    }, 1000);
  }
}
