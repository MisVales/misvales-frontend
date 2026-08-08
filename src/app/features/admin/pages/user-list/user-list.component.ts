import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../data-access/user.service';
import { UserRes, UserState, RoleRes } from '../../data-access/admin.dtos';
import { RoleService } from '../../data-access/role.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  users = signal<UserRes[]>([]);
  totalUsers = signal(0);
  
  filterStatus = signal<UserState | ''>('');
  filterRole = signal<string>('');
  filterSearch = signal<string>('');
  page = signal(1);

  isActionLoading = signal<string | null>(null);

  // Tabs
  activeTab = signal<'directory' | 'roles'>('directory');

  // Modal State for Inviting
  showInviteModal = signal(false);
  inviteName = signal('');
  inviteEmail = signal('');
  inviteRoleId = signal('');

  availableRoles = signal<RoleRes[]>([]);

  async ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  async loadRoles() {
    try {
      const roles = await firstValueFrom(this.roleService.getRoles());
      this.availableRoles.set(roles.filter(r => r.name.toLowerCase() !== 'gerente general' && r.id !== 'gerente_general'));
    } catch (err) {
      console.error('Failed to load roles', err);
    }
  }

  loadUsers() {
    this.userService.getUsers({
      search: this.filterSearch() || undefined,
      state: (this.filterStatus() as UserState) || undefined,
      role_id: this.filterRole() || undefined,
      page: this.page()
    }).subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.totalUsers.set(res.total);
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  onFilterChange() {
    this.page.set(1);
    this.loadUsers();
  }

  inviteUser() {
    if (!this.inviteEmail() || !this.inviteName() || !this.inviteRoleId()) return;
    this.isActionLoading.set('invite');
    
    this.userService.createAccount({ 
      name: this.inviteName(), 
      email: this.inviteEmail(),
      role_id: this.inviteRoleId(),
      branch_id: null,
      send_invitation: true
    }).subscribe({
      next: () => {
        this.isActionLoading.set(null);
        this.showInviteModal.set(false);
        this.inviteEmail.set('');
        this.inviteName.set('');
        this.inviteRoleId.set('');
        alert('Se ha enviado el correo de invitación correctamente.');
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        this.isActionLoading.set(null);
        alert(err.error?.message || 'Error invitando usuario');
      }
    });
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
    
    this.isActionLoading.set(`block-${user.id}`);
    
    const request = user.state === 'BLOCKED' 
      ? this.userService.unblockUser(user.id)
      : this.userService.blockUser(user.id);

    request.subscribe({
      next: () => {
        this.isActionLoading.set(null);
        this.closeBlockModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        this.isActionLoading.set(null);
        alert('Error cambiando estado del usuario');
      }
    });
  }
}
