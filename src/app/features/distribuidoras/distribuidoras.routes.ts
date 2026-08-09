import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
// We will import components later

export const distribuidorasRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/listado/listado-distribuidoras-page.component').then(m => m.ListadoDistribuidorasPageComponent),
    canActivate: [permissionGuard('distributors.view_any')]
  },
  {
    path: 'altas/:id',
    loadComponent: () => import('./pages/activacion/activacion-distribuidora-page.component').then(m => m.ActivacionDistribuidoraPageComponent),
    canActivate: [permissionGuard('distributors.activate')]
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/detalle/detalle-distribuidora-page.component').then(m => m.DetalleDistribuidoraPageComponent),
    canActivate: [permissionGuard('distributors.view')]
  }
];
