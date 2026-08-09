import { Routes } from '@angular/router';
import { roleWriteGuard } from '../../core/guards/role-write.guard';
import { permissionGuard } from '../../core/guards/permission.guard';

export const CATEGORIAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/categorias-lista/categorias-lista.component').then(m => m.CategoriasListaComponent)
  },
  {
    path: 'nueva',
    canActivate: [roleWriteGuard],
    loadComponent: () => import('./pages/categoria-detalle/categoria-detalle.component').then(m => m.CategoriaDetalleComponent)
  },
  {
    path: ':id',
    canActivate: [permissionGuard('view_categories')],
    loadComponent: () => import('./pages/categoria-detalle/categoria-detalle.component').then(m => m.CategoriaDetalleComponent)
  }
];
