import { Routes } from '@angular/router';
import { negativeRoleGuard } from '../../core/guards/negative-role.guard';
import { anyPermissionGuard } from '../../core/guards/permission.guard';

export const relacionesPagosRoutes: Routes = [
  {
    path: 'relaciones',
    loadComponent: () =>
      import('./pages/relaciones-page.component').then((m) => m.RelacionesPageComponent),
    canActivate: [
      negativeRoleGuard(['cashier']),
      anyPermissionGuard(['relations.view_own', 'relations.view_assigned', 'relations.view_branch', 'relations.view_global']),
    ],
  },
  {
    path: 'archivo-bancario',
    loadComponent: () =>
      import('../reconciliation/pages/archivo-bancario-page.component').then((m) => m.ArchivoBancarioPageComponent),
    canActivate: [
      anyPermissionGuard([
        'bank_imports.create_branch',
        'bank_imports.view_branch',
        'bank_imports.view_global',
      ]),
    ],
  },
  {
    path: 'aclaraciones',
    loadComponent: () =>
      import('../reconciliation/pages/aclaraciones-page.component').then((m) => m.AclaracionesPageComponent),
    canActivate: [
      anyPermissionGuard([
        'payment_clarifications.view_branch',
        'manual_reconciliation.view_branch',
        'refunds.execute_branch',
      ]),
    ],
  },
  {
    path: 'conciliacion',
    loadComponent: () =>
      import('../reconciliation/pages/conciliacion-page.component').then((m) => m.ConciliacionPageComponent),
    canActivate: [
      anyPermissionGuard(['bank_movements.view_branch', 'bank_movements.view_global']),
    ],
  },
  {
    path: 'pagos',
    loadComponent: () =>
      import('../payments/pages/pagos-page.component').then((m) => m.PagosPageComponent),
    canActivate: [
      anyPermissionGuard([
        'relations.view_own',
        'relations.view_assigned',
        'relations.view_branch',
        'relations.view_global',
      ]),
    ],
  },
  {
    path: 'excedentes',
    loadComponent: () =>
      import('../payments/pages/excedentes-page.component').then((m) => m.ExcedentesPageComponent),
    canActivate: [
      negativeRoleGuard(['cashier']),
      anyPermissionGuard(['surpluses.view_own', 'surpluses.view_branch', 'surpluses.view_global']),
    ],
  },
];
