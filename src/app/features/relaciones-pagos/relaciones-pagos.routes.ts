import { Routes } from '@angular/router';
import { anyPermissionGuard } from '../../core/guards/permission.guard';

export const relacionesPagosRoutes: Routes = [
  {
    path: 'relaciones',
    loadComponent: () =>
      import('./pages/relaciones-page.component').then((m) => m.RelacionesPageComponent),
    canActivate: [
      anyPermissionGuard(['relations.view_own', 'relations.view_branch', 'relations.view_global']),
    ],
  },
  {
    path: 'archivo-bancario',
    loadComponent: () =>
      import('./pages/archivo-bancario-page.component').then((m) => m.ArchivoBancarioPageComponent),
    canActivate: [
      anyPermissionGuard([
        'bank_imports.create_branch',
        'bank_imports.view_branch',
        'bank_imports.view_global',
      ]),
    ],
  },
  {
    path: 'conciliacion',
    loadComponent: () =>
      import('./pages/conciliacion-page.component').then((m) => m.ConciliacionPageComponent),
    canActivate: [
      anyPermissionGuard(['bank_movements.view_branch', 'bank_movements.view_global']),
    ],
  },
  {
    path: 'pagos',
    loadComponent: () =>
      import('./pages/pagos-page.component').then((m) => m.PagosPageComponent),
    canActivate: [
      anyPermissionGuard(['relations.view_own', 'relations.view_branch', 'relations.view_global']),
    ],
  },
  {
    path: 'excedentes',
    loadComponent: () =>
      import('./pages/excedentes-page.component').then((m) => m.ExcedentesPageComponent),
    canActivate: [
      anyPermissionGuard(['surpluses.view_own', 'surpluses.view_branch', 'surpluses.view_global']),
    ],
  },
];
