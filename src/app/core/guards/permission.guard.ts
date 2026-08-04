import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session.store';

export const permissionGuard = (requiredPermission: string): CanActivateFn => {
  return (route, state) => {
    const sessionStore = inject(SessionStore);
    const router = inject(Router);

    const permissions = sessionStore.permissions();
    if (permissions && permissions.includes(requiredPermission)) {
      return true;
    }

    // Opcional: Redirigir a una página de 'Acceso Denegado'
    return router.createUrlTree(['/']);
  };
};
