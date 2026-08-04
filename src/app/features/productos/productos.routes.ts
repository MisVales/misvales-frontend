import { Routes } from '@angular/router';
import { roleWriteGuard } from '../../core/guards/role-write.guard';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/productos-list/productos-list.component').then(c => c.ProductosListComponent)
  },
  {
    path: 'nuevo',
    canActivate: [roleWriteGuard],
    loadComponent: () => import('./pages/producto-detail/producto-detail.component').then(c => c.ProductoDetailComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/producto-detail/producto-detail.component').then(c => c.ProductoDetailComponent)
  }
];
