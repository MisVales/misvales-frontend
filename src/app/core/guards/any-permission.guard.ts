import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionStore } from '@core/session/session.store';

export const anyPermissionGuard: CanActivateFn = (route) => {
  const permissions = route.data['permissions'];
  const session = inject(SessionStore);

  return Array.isArray(permissions) &&
    permissions.some(
      (permission: unknown) => typeof permission === 'string' && session.hasPermission(permission),
    )
    ? true
    : inject(Router).parseUrl('/403');
};
