import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { SessionStore } from '../../core/session/session.store';

const hideFromDistributorGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  return session.roles().includes('distributor') ? inject(Router).createUrlTree(['/vales']) : true;
};

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [hideFromDistributorGuard, permissionGuard('clients.view')],
    loadComponent: () => import('./pages/listado/listado-clientes-page.component').then(m => m.ListadoClientesPageComponent)
  },
  {
    path: 'nuevo',
    canActivate: [hideFromDistributorGuard, permissionGuard('clients.create')],
    loadComponent: () => import('./pages/nuevo/nuevo-cliente-page.component').then(m => m.NuevoClientePageComponent)
  },
  {
    path: 'cartera',
    canActivate: [hideFromDistributorGuard, permissionGuard('clients.view_portfolio')],
    loadComponent: () => import('./pages/cartera/cartera-cliente-page.component').then(m => m.CarteraClientePageComponent)
  },
  {
    path: ':id',
    canActivate: [hideFromDistributorGuard, permissionGuard('clients.view')],
    loadComponent: () => import('./pages/detalle/detalle-cliente-page.component').then(m => m.DetalleClientePageComponent)
  },
  {
    path: ':id/cartera',
    canActivate: [hideFromDistributorGuard, permissionGuard('clients.view_portfolio')],
    loadComponent: () => import('./pages/cartera/cartera-cliente-page.component').then(m => m.CarteraClientePageComponent)
  }
];
