import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'inicio',
    loadComponent: () => import('../dashboard/dashboard').then(c => c.Dashboard)
  },
  {
    path: 'usuarios',
    canActivate: [permissionGuard('users.view')],
    loadComponent: () => import('./pages/user-list/user-list.component').then(c => c.UserListComponent)
  },
  {
    path: 'usuarios/:id',
    canActivate: [permissionGuard('users.view')],
    loadComponent: () => import('./pages/user-detail/user-detail.component').then(c => c.UserDetailComponent)
  },
  {
    path: 'roles',
    canActivate: [permissionGuard('roles.view')],
    loadComponent: () => import('./pages/roles-permissions/roles-permissions.component').then(c => c.RolesPermissionsComponent)
  },
  {
    path: 'invitaciones',
    canActivate: [permissionGuard('users.manage_state')],
    loadComponent: () => import('./pages/invitations/invitations').then(c => c.Invitations)
  },
  {
    path: 'auditoria',
    canActivate: [permissionGuard('audit.view')],
    loadComponent: () => import('./pages/audit-logs/audit-logs').then(c => c.AuditLogs)
  },
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  }
];
