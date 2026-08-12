import { Routes } from '@angular/router';
import { anyPermissionGuard } from '../../core/guards/permission.guard';
const route = {
  loadComponent: () => import('./puntos-page.component').then((m) => m.PuntosPageComponent),
  canActivate: [
    anyPermissionGuard([
      'points.view_own',
      'points.authorize_branch',
      'points.authorize_global',
      'points.deliver_branch',
    ]),
  ],
};
export const puntosRoutes: Routes = [
  { path: '', ...route },
  { path: 'canjes', ...route },
];
