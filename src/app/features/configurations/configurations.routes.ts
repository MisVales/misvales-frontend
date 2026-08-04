import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { permissionGuard } from '@core/guards/permission.guard';

export const configurationsRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        canActivate: [permissionGuard('view_configurations')], // placeholder permission
        loadComponent: () => import('./pages/configurations-list/configurations-list.component').then(m => m.ConfiguracionesListaComponent)
      },
      {
        path: ':clave',
        canActivate: [permissionGuard('view_configurations')],
        loadComponent: () => import('./pages/configuration-detail/configuration-detail.component').then(m => m.ConfiguracionDetalleComponent)
      }
    ]
  }
];
