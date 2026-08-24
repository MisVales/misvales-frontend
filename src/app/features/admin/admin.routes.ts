import { Routes } from '@angular/router';
import { anyPermissionGuard, permissionGuard } from '../../core/guards/permission.guard';

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
    path: 'invitaciones',
    canActivate: [permissionGuard('users.manage_state')],
    loadComponent: () => import('./pages/invitations/invitations').then(c => c.Invitations)
  },
  {
    path: 'auditoria',
    canActivate: [anyPermissionGuard(['audit.view_global', 'audit.view_branch', 'audit.view'])],
    loadChildren: () => import('../audit/auditoria.routes').then((m) => m.AUDITORIA_ROUTES)
  },
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  }
];
