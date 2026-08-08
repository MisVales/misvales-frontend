import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/user-list/user-list.component').then(c => c.UserListComponent)
  },
  {
    path: 'usuarios/:id',
    loadComponent: () => import('./pages/user-detail/user-detail.component').then(c => c.UserDetailComponent)
  },
  {
    path: 'invitaciones',
    loadComponent: () => import('./pages/invitations/invitations').then(c => c.Invitations)
  },
  {
    path: 'auditoria',
    loadComponent: () => import('./pages/audit-logs/audit-logs').then(c => c.AuditLogs)
  },
  {
    path: '',
    redirectTo: 'usuarios',
    pathMatch: 'full'
  }
];
