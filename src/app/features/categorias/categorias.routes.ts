import { Routes } from '@angular/router';
import { roleWriteGuard } from '../../core/guards/role-write.guard';

export const CATEGORIAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/categorias-list/categorias-list.component').then(c => c.CategoriasListComponent)
  },
  {
    path: 'nueva',
    canActivate: [roleWriteGuard],
    loadComponent: () => import('./pages/categoria-detail/categoria-detail.component').then(c => c.CategoriaDetailComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/categoria-detail/categoria-detail.component').then(c => c.CategoriaDetailComponent)
  }
];
