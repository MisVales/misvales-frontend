import { Routes } from '@angular/router';
import { anyPermissionGuard } from '../../core/guards/permission.guard';

export const riesgoRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./riesgo-page.component').then((module) => module.RiesgoPageComponent),
    canActivate: [
      anyPermissionGuard([
        'risk.view_own',
        'risk.view_assigned',
        'risk.view_branch',
        'risk.view_global',
      ]),
    ],
  },
];
