import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session.store';

export const roleWriteGuard: CanActivateFn = (route, state) => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);

  const permissions = sessionStore.permissions();
  if (permissions.includes('catalogs.manage') || permissions.includes('all')) {
    return true;
  }

  return router.createUrlTree(['/acceso-denegado']);
};
