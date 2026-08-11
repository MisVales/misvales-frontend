import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { SessionStore } from '../../core/session/session.store';

const responsibleDistributorGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  return session.roles().includes('distributor') ? true : inject(Router).createUrlTree(['/clientes']);
};

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard('clients.view')],
    loadComponent: () => import('./pages/listado/listado-clientes-page.component').then(m => m.ListadoClientesPageComponent)
  },
  {
    path: 'nuevo',
    canActivate: [permissionGuard('clients.create'), responsibleDistributorGuard],
    loadComponent: () => import('./pages/nuevo/nuevo-cliente-page.component').then(m => m.NuevoClientePageComponent)
  },
  {
    path: ':id',
    canActivate: [permissionGuard('clients.view')],
    loadComponent: () => import('./pages/detalle/detalle-cliente-page.component').then(m => m.DetalleClientePageComponent)
  },
  {
    path: ':id/cartera',
    canActivate: [permissionGuard('clients.view_portfolio')],
    loadComponent: () => import('./pages/cartera/cartera-cliente-page.component').then(m => m.CarteraClientePageComponent)
  }
];
