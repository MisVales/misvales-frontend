import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionStore } from '@core/session/session.store';

import { safeReturnUrl } from './return-url.util';

export const sessionGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionStore);
  if (session.hasSession()) {
    return true;
  }

  const router = inject(Router);
  const returnUrl = safeReturnUrl(state.url);
  return router.createUrlTree(['/acceso'], {
    queryParams: returnUrl ? { returnUrl } : {},
  });
};
