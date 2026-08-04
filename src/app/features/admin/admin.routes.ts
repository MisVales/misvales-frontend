import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/user-list/user-list.component').then(c => c.UserListComponent)
  },
  {
    path: 'roles',
    loadComponent: () => import('./pages/role-list/role-list.component').then(c => c.RoleListComponent)
  },
  {
    path: '',
    redirectTo: 'usuarios',
    pathMatch: 'full'
  }
];
