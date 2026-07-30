import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionStore } from '@core/session/session.store';

export const permissionGuard: CanActivateFn = (route) => {
  const permission = route.data['permission'];
  return typeof permission === 'string' && inject(SessionStore).hasPermission(permission)
    ? true
    : inject(Router).parseUrl('/403');
};
