import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session.store';

export const roleWriteGuard: CanActivateFn = (route, state) => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);

  const roles = sessionStore.roles();
  // Asumimos que el rol de Gerente General puede ser 'gerente_general' o 'admin' de sistema
  const allowedRoles = ['gerente_general', 'admin'];

  if (roles && roles.some(role => allowedRoles.includes(role))) {
    return true;
  }

  // Redirigir si no tiene permisos de escritura
  return router.createUrlTree(['/']);
};
