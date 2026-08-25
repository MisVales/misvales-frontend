import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { anyPermissionGuard } from '../../core/guards/permission.guard';
import { SessionStore } from '../../core/session/session.store';

const distributorRiskInAccountGuard: CanActivateFn = () => {
  const session = inject(SessionStore);

  return session.roles().includes('distributor')
    ? inject(Router).createUrlTree(['/seguridad/profile'])
    : true;
};

export const riesgoRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./riesgo-page.component').then((module) => module.RiesgoPageComponent),
    canActivate: [
      distributorRiskInAccountGuard,
      anyPermissionGuard([
        'risk.view_own',
        'risk.view_assigned',
        'risk.view_branch',
        'risk.view_global',
      ]),
    ],
  },
];
