import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session.store';

export const negativeRoleGuard = (deniedRoles: readonly string[]): CanActivateFn => () => {
  const roles = inject(SessionStore).roles();
  return deniedRoles.some(role => roles.includes(role))
    ? inject(Router).createUrlTree(['/unauthorized'])
    : true;
};
