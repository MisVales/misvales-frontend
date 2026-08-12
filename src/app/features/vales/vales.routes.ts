import { Routes } from '@angular/router';
import { anyPermissionGuard } from '../../core/guards/permission.guard';

export const valesRoutes: Routes = [{
  path: '',
  loadComponent: () => import('./pages/vales-page.component').then(module => module.ValesPageComponent),
  canActivate: [anyPermissionGuard(['vouchers.create_own', 'vouchers.view_own', 'vouchers.view_assigned', 'vouchers.view_branch', 'vouchers.view_global'])],
}];
