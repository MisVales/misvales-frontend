import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session.store';

export const negativeRoleGuard = (deniedRoles: readonly string[]): CanActivateFn => () => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);
  const roles = sessionStore.roles();

  if (deniedRoles.some((role) => roles.includes(role))) {
    return router.createUrlTree(['/acceso-denegado']);
  }

  return true;
};
