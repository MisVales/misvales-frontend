import { Routes } from '@angular/router';
import { roleWriteGuard } from '../../core/guards/role-write.guard';
import { permissionGuard } from '../../core/guards/permission.guard';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/productos-lista/productos-lista.component').then(m => m.ProductosListaComponent)
  },
  {
    path: 'nuevo',
    canActivate: [roleWriteGuard],
    loadComponent: () => import('./pages/producto-detalle/producto-detalle.component').then(m => m.ProductoDetalleComponent)
  },
  {
    path: ':id',
    canActivate: [permissionGuard('view_products')],
    loadComponent: () => import('./pages/producto-detalle/producto-detalle.component').then(m => m.ProductoDetalleComponent)
  }
];
