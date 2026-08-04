import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session.store';

export const scopeGuard: CanActivateFn = (route, state) => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);

  // Require an active branch (sucursal) to proceed
  if (sessionStore.activeBranch()) {
    return true;
  }

  // Opcional: Redirigir a una página de selección de sucursal
  return router.createUrlTree(['/seleccionar-sucursal']);
};
