import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { permissionGuard } from '@core/guards/permission.guard';

export const organizationRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'sucursales',
        canActivate: [permissionGuard('view_branches')],
        loadComponent: () => import('./pages/branches-list/branches-list').then(m => m.BranchesList)
      },
      {
        path: 'sucursales/nueva',
        canActivate: [permissionGuard('manage_branches')],
        loadComponent: () => import('./pages/branch-form/branch-form').then(m => m.BranchForm)
      },
      {
        path: 'sucursales/:id/editar',
        canActivate: [permissionGuard('manage_branches')],
        loadComponent: () => import('./pages/branch-form/branch-form').then(m => m.BranchForm)
      },
      {
        path: 'sucursales/:id',
        canActivate: [permissionGuard('view_branches')],
        loadComponent: () => import('./pages/branch-detail/branch-detail').then(m => m.BranchDetail)
      },
      {
        path: 'personal',
        canActivate: [permissionGuard('view_staff')],
        loadComponent: () => import('./pages/staff-list/staff-list').then(m => m.StaffList)
      },
      {
        path: 'personal/:id',
        canActivate: [permissionGuard('view_staff')],
        loadComponent: () => import('./pages/staff-detail/staff-detail').then(m => m.StaffDetail)
      },
      {
        path: 'personal/:id/asignar',
        canActivate: [permissionGuard('manage_staff')],
        loadComponent: () => import('./pages/staff-assignment/staff-assignment').then(m => m.StaffAssignment)
      },
      { path: '', redirectTo: 'sucursales', pathMatch: 'full' }
    ]
  }
];
