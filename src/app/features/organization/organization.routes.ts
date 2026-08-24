import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { anyPermissionGuard, permissionGuard } from '@core/guards/permission.guard';

export const organizationRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'sucursales',
        canActivate: [permissionGuard('branches.view')],
        loadComponent: () =>
          import('./pages/branches-list/branches-list').then((m) => m.BranchesList),
      },
      {
        path: 'sucursales/nueva',
        canActivate: [permissionGuard('branches.create')],
        loadComponent: () => import('./pages/branch-form/branch-form').then((m) => m.BranchForm),
      },
      {
        path: 'sucursales/:id/editar',
        canActivate: [permissionGuard('branches.update')],
        loadComponent: () => import('./pages/branch-form/branch-form').then((m) => m.BranchForm),
      },
      {
        path: 'sucursales/:id/configuracion',
        canActivate: [permissionGuard('branches.view')],
        loadComponent: () =>
          import('./pages/branch-detail/branch-detail').then((m) => m.BranchDetail),
      },
      {
        path: 'sucursales/:id',
        canActivate: [anyPermissionGuard(['branches.view', 'roles.assign'])],
        loadComponent: () =>
          import('./pages/assignments/assignments').then((m) => m.AssignmentsPage),
      },
      {
        path: 'asignaciones',
        redirectTo: 'sucursales',
        pathMatch: 'full',
      },
      {
        path: 'personal',
        canActivate: [anyPermissionGuard(['users.view', 'roles.assign', 'branches.view'])],
        loadComponent: () => import('./pages/staff-list/staff-list').then((m) => m.StaffList),
      },
      {
        path: 'personal/:id',
        canActivate: [anyPermissionGuard(['users.view', 'roles.assign', 'branches.view'])],
        loadComponent: () => import('./pages/staff-detail/staff-detail').then((m) => m.StaffDetail),
      },
      {
        path: 'personal/:id/asignar',
        canActivate: [permissionGuard('roles.assign')],
        loadComponent: () =>
          import('./pages/staff-assignment/staff-assignment').then((m) => m.StaffAssignment),
      },
      { path: '', redirectTo: 'sucursales', pathMatch: 'full' },
    ],
  },
];
