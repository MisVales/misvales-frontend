import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session.store';

export const managerVpnGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  const roles = session.roles();
  const isManager = roles.includes('general_manager') || roles.includes('branch_manager');

  return !isManager || session.managerActions()
    ? true
    : router.createUrlTree(['/acceso-denegado'], { queryParams: { reason: 'vpn_required' } });
};
