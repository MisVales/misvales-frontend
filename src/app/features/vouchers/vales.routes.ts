import { Routes } from '@angular/router';
import { anyPermissionGuard } from '../../core/guards/permission.guard';

export const valesRoutes: Routes = [
  {
    path: 'caja-feriado',
    loadComponent: () =>
      import('../counter/pages/caja-feriado-page.component').then(
        (module) => module.CajaFeriadoPageComponent,
      ),
    canActivate: [
      anyPermissionGuard([
        'vouchers.cash_branch',
        'voucher_modifications.authorize_branch',
        'voucher_modifications.authorize_global',
      ]),
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/vales-page.component').then((module) => module.ValesPageComponent),
    canActivate: [
      anyPermissionGuard([
        'vouchers.create_own',
        'vouchers.view_own',
        'vouchers.view_assigned',
        'vouchers.view_branch',
        'vouchers.view_global',
      ]),
    ],
  },
];
