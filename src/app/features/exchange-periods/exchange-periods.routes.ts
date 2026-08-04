import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { permissionGuard } from '@core/guards/permission.guard';

export const exchangePeriodsRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        canActivate: [permissionGuard('view_exchange_periods')], // placeholder permission
        loadComponent: () => import('./pages/exchange-periods-list/exchange-periods-list.component').then(m => m.PeriodosListaComponent)
      },
      {
        path: ':id',
        canActivate: [permissionGuard('view_exchange_periods')],
        loadComponent: () => import('./pages/exchange-period-form/exchange-period-form.component').then(m => m.PeriodoFormularioComponent)
      }
    ]
  }
];
