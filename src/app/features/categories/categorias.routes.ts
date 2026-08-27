import { Routes } from '@angular/router';
import { roleWriteGuard } from '../../core/guards/role-write.guard';
import { permissionGuard } from '../../core/guards/permission.guard';
import { managerVpnGuard } from '../../core/guards/manager-vpn.guard';

export const CATEGORIAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/categorias-lista/categorias-lista.component').then(m => m.CategoriasListaComponent)
  },
  {
    path: 'nueva',
    canActivate: [roleWriteGuard, managerVpnGuard],
    loadComponent: () => import('./pages/categoria-detalle/categoria-detalle.component').then(m => m.CategoriaDetalleComponent)
  },
  {
    path: ':id',
    canActivate: [permissionGuard('catalogs.manage')],
    loadComponent: () => import('./pages/categoria-detalle/categoria-detalle.component').then(m => m.CategoriaDetalleComponent)
  }
];
