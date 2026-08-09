import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/listado/listado-clientes-page.component').then(m => m.ListadoClientesPageComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./pages/nuevo/nuevo-cliente-page.component').then(m => m.NuevoClientePageComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/detalle/detalle-cliente-page.component').then(m => m.DetalleClientePageComponent)
  },
  {
    path: ':id/cartera',
    loadComponent: () => import('./pages/cartera/cartera-cliente-page.component').then(m => m.CarteraClientePageComponent)
  }
];
