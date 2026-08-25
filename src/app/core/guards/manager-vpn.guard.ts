import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session.store';

export const managerVpnGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  const roles = session.roles();
  const isManager = roles.includes('general_manager') || roles.includes('branch_manager');
  const isVpnHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'vpn.safeacces.lat' ||
      window.location.hostname.startsWith('vpn.'));

  const hasManagerActions = Boolean(session.managerActions?.());
  const hasVpn = Boolean(session.vpn?.());

  return !isManager || hasManagerActions || hasVpn || isVpnHost
    ? true
    : router.createUrlTree(['/acceso-denegado'], { queryParams: { reason: 'vpn_required' } });
};
