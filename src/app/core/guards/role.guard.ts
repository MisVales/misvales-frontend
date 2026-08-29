import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session.store';

export const roleGuard = (allowedRoles: readonly string[]): CanActivateFn => () => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);
  const roles = sessionStore.roles();

  if (allowedRoles.some((role) => roles.includes(role))) {
    return true;
  }

  return router.createUrlTree([
    sessionStore.isAuthenticated() ? '/acceso-denegado' : '/auth/login',
  ]);
};
