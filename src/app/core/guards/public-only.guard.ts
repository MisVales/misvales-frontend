import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { experienceRoot } from '@core/guards/return-url.util';
import { SessionStore } from '@core/session/session.store';

export const publicOnlyGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const access = session.access();
  return access ? inject(Router).parseUrl(experienceRoot(access.experience)) : true;
};
