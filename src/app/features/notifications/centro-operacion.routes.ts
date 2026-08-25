import { Routes } from '@angular/router';
import { anyPermissionGuard } from '../../core/guards/permission.guard';

export const centroOperacionRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./centro-operacion-page.component').then(
        (module) => module.CentroOperacionPageComponent,
      ),
    canActivate: [
      anyPermissionGuard([
        'notifications.view_own',
        'reports.view_branch',
        'reports.view_global',
        'audit.view_branch',
        'audit.view_global',
        'logs.view_branch',
        'logs.view_global',
      ]),
    ],
  },
];
