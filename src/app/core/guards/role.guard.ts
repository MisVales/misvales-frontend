import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { RoleCode, SessionStore } from '@core/session/session.store';

export const roleGuard: CanActivateFn = (route) => {
  const roles = route.data['roles'];
  const role = inject(SessionStore).access()?.role;
  return Array.isArray(roles) && role && roles.includes(role as RoleCode)
    ? true
    : inject(Router).parseUrl('/403');
};
