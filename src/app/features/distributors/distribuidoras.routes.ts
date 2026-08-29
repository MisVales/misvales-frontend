import { Routes } from '@angular/router';
import { anyPermissionGuard, permissionGuard } from '../../core/guards/permission.guard';
import { ListadoDistribuidorasPageComponent } from './pages/listado/listado-distribuidoras-page.component';
import { DetalleDistribuidoraPageComponent } from './pages/detalle/detalle-distribuidora-page.component';
import { ActivacionDistribuidoraPageComponent } from './pages/activacion/activacion-distribuidora-page.component';
import { LineasCreditoPageComponent } from '@features/credit/pages/lineas-credito/lineas-credito-page.component';
import { IncrementosLineaPageComponent } from '@features/credit/pages/incrementos-linea/incrementos-linea-page.component';

export const distribuidorasRoutes: Routes = [
  {
    path: '',
    component: ListadoDistribuidorasPageComponent,
    canActivate: [anyPermissionGuard(['distributors.view_any'])]
  },
  {
    path: 'lineas-credito',
    component: LineasCreditoPageComponent,
    canActivate: [anyPermissionGuard(['credit_lines.view_own', 'credit_lines.view_assigned', 'credit_lines.view_branch', 'credit_lines.view_global'])]
  },
  {
    path: 'incrementos-linea',
    component: IncrementosLineaPageComponent,
    canActivate: [anyPermissionGuard(['credit_increase_requests.view_own', 'credit_increase_requests.view_assigned', 'credit_increase_requests.view_branch', 'credit_increase_requests.view_global'])]
  },
  {
    path: ':id/activacion',
    component: ActivacionDistribuidoraPageComponent,
    canActivate: [permissionGuard('distributors.activate')]
  },
  {
    path: ':id',
    component: DetalleDistribuidoraPageComponent,
    canActivate: [anyPermissionGuard(['distributors.view_any', 'distributors.view'])]
  },
];
