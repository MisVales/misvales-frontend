import { Routes } from '@angular/router';
import { roleWriteGuard } from '../../core/guards/role-write.guard';
import { anyPermissionGuard, permissionGuard } from '../../core/guards/permission.guard';
import { managerVpnGuard } from '../../core/guards/manager-vpn.guard';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [anyPermissionGuard(['catalogs.view_published', 'catalogs.view_history'])],
    loadComponent: () => import('./pages/productos-lista/productos-lista.component').then(m => m.ProductosListaComponent)
  },
  {
    path: 'nuevo',
    canActivate: [roleWriteGuard, permissionGuard('catalogs.manage'), managerVpnGuard],
    loadComponent: () => import('./pages/producto-detalle/producto-detalle.component').then(m => m.ProductoDetalleComponent)
  },
  {
    path: ':id',
    canActivate: [permissionGuard('catalogs.manage')],
    loadComponent: () => import('./pages/producto-detalle/producto-detalle.component').then(m => m.ProductoDetalleComponent)
  }
];
