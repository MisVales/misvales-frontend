import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { permissionGuard } from '@core/guards/permission.guard';

export const CONFIGURACIONES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        canActivate: [permissionGuard('catalogs.view_published')],
        loadComponent: () => import('./pages/configuraciones-lista/configuraciones-lista.component').then(m => m.ConfiguracionesListaComponent)
      },
      {
        path: ':clave',
        canActivate: [permissionGuard('catalogs.view_history')],
        loadComponent: () => import('./pages/configuracion-detalle/configuracion-detalle.component').then(m => m.ConfiguracionDetalleComponent)
      }
    ]
  }
];
