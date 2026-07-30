import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ApplicationExperience, SessionStore } from '@core/session/session.store';

export const experienceGuard: CanActivateFn = (route) => {
  const expected = route.data['experience'] as ApplicationExperience | undefined;
  const access = inject(SessionStore).access();

  return expected && access?.experience === expected ? true : inject(Router).parseUrl('/403');
};
