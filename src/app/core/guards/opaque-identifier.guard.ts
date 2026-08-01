import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const opaqueIdentifierGuard: CanActivateFn = (route) => {
  const parameter = route.data['identifierParameter'];
  const identifier = typeof parameter === 'string' ? route.paramMap.get(parameter)?.trim() : null;

  return identifier ? true : inject(Router).parseUrl('/404');
};
