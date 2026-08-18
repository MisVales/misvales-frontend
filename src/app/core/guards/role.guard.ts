import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session.store';

export const roleGuard = (allowedRoles: readonly string[]): CanActivateFn => () => {
  const roles = inject(SessionStore).roles();
  return allowedRoles.some(role => roles.includes(role))
    ? true
    : inject(Router).createUrlTree(['/acceso-denegado']);
};
