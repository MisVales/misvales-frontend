import { Routes } from '@angular/router';
import { anyPermissionGuard, permissionGuard } from '../../core/guards/permission.guard';
import { ListadoDistribuidorasPageComponent } from './pages/listado/listado-distribuidoras-page.component';
import { DetalleDistribuidoraPageComponent } from './pages/detalle/detalle-distribuidora-page.component';
import { ActivacionDistribuidoraPageComponent } from './pages/activacion/activacion-distribuidora-page.component';
import { LineasCreditoPageComponent } from './pages/lineas-credito/lineas-credito-page.component';
import { IncrementosLineaPageComponent } from './pages/incrementos-linea/incrementos-linea-page.component';

export const distribuidorasRoutes: Routes = [
  {
    path: '',
    component: ListadoDistribuidorasPageComponent,
    canActivate: [anyPermissionGuard(['distributors.view_any', 'distributors.view'])]
  },
  {
    path: 'lineas-credito',
    component: LineasCreditoPageComponent,
    canActivate: [anyPermissionGuard(['distributors.view_any', 'distributors.view'])]
  },
  {
    path: 'incrementos-linea',
    component: IncrementosLineaPageComponent,
    canActivate: [anyPermissionGuard(['distributors.view_any', 'distributors.view'])]
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
