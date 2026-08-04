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
    path: 'roles',
    loadComponent: () => import('./pages/role-list/role-list.component').then(c => c.RoleListComponent)
  },
  {
    path: '',
    redirectTo: 'usuarios',
    pathMatch: 'full'
  }
];
