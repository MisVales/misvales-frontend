import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
// We will import components later

export const distribuidorasRoutes: Routes = [
  {
    path: '',
    // component: ListadoDistribuidorasPageComponent,
    canActivate: [permissionGuard],
    data: { permissions: ['distributors.view_any', 'distributors.view'] }
  },
  {
    path: ':id',
    // component: DetalleDistribuidoraPageComponent,
    canActivate: [permissionGuard],
    data: { permissions: ['distributors.view_any', 'distributors.view'] }
  },
  {
    path: ':id/activacion',
    // component: ActivacionDistribuidoraPageComponent,
    canActivate: [permissionGuard],
    data: { permissions: ['distributors.activate'] } // Or appropriate permission
  }
];
