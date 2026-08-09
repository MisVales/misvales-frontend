import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/listado/listado-clientes-page.component').then(m => m.ListadoClientesPageComponent),
    canActivate: [permissionGuard('clients.view')]
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./pages/nuevo/nuevo-cliente-page.component').then(m => m.NuevoClientePageComponent),
    canActivate: [permissionGuard('clients.create')]
  },
  {
    path: 'cartera',
    loadComponent: () => import('./pages/cartera/cartera-informativa-page.component').then(m => m.CarteraInformativaPageComponent),
    canActivate: [permissionGuard('clients.view_portfolio')]
  },
  {
    path: ':id/cartera',
    loadComponent: () => import('./pages/cartera/cartera-cliente-page.component').then(m => m.CarteraClientePageComponent),
    canActivate: [permissionGuard('clients.view_portfolio')]
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/detalle/detalle-cliente-page.component').then(m => m.DetalleClientePageComponent),
    canActivate: [permissionGuard('clients.view')]
  }
];
