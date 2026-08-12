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
];
