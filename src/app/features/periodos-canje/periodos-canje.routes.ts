import { Routes } from '@angular/router';
import { roleWriteGuard } from '../../core/guards/role-write.guard';
import { permissionGuard } from '../../core/guards/permission.guard';

export const PERIODOS_CANJE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/periodos-canje-lista/periodos-canje-lista.component').then(m => m.PeriodosCanjeListaComponent)
  },
  {
    path: 'nuevo',
    canActivate: [roleWriteGuard],
    loadComponent: () => import('./pages/periodo-canje-formulario/periodo-canje-formulario.component').then(m => m.PeriodoCanjeFormularioComponent)
  },
  {
    path: ':id',
    canActivate: [permissionGuard('catalogs.manage')],
    loadComponent: () => import('./pages/periodo-canje-formulario/periodo-canje-formulario.component').then(m => m.PeriodoCanjeFormularioComponent)
  }
];
