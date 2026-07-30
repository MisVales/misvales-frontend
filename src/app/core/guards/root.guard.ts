import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { experienceRoot } from '@core/guards/return-url.util';
import { SessionStore } from '@core/session/session.store';

export const rootGuard: CanActivateFn = () => {
  const access = inject(SessionStore).access();
  return inject(Router).parseUrl(access ? experienceRoot(access.experience) : '/acceso');
};
