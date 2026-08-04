import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RoleRes } from '../../data-access/admin.dtos';

@Component({
  selector: 'app-role-list',
  standalone: true,
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleListComponent {
  roles = signal<RoleRes[]>([
    { id: '1', name: 'Administrador', permissions: ['users.view', 'users.edit', 'users.create', 'roles.view', 'roles.edit'] },
    { id: '2', name: 'Gerente', permissions: ['users.view', 'reports.view', 'reports.export'] },
    { id: '3', name: 'Cajero', permissions: ['sales.create', 'sales.view'] },
  ]);

  getGroupedPermissions(permissions: string[]): { module: string, actions: string[] }[] {
    const groups: Record<string, string[]> = {};
    for (const perm of permissions) {
      const [module, action] = perm.split('.');
      if (!groups[module]) groups[module] = [];
      groups[module].push(action);
    }
    
    return Object.keys(groups).map(module => ({
      module,
      actions: groups[module]
    }));
  }
}
