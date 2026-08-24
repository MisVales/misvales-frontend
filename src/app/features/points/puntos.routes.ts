import { Routes } from '@angular/router';
import { anyPermissionGuard } from '../../core/guards/permission.guard';

export const PUNTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/canje-puntos-page/canje-puntos-page.component').then((m) => m.CanjePuntosPageComponent),
    canActivate: [
      anyPermissionGuard([
        'points.view_own',
        'points.view_branch',
        'points.view_global',
        'points.request_own',
        'points.authorize_branch',
        'points.authorize_global',
        'points.deliver_branch',
      ]),
    ],
  },
];
