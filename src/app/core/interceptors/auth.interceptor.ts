import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { AuthTokenStore } from '../session/auth-token.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let headers = req.headers.set('X-Request-Id', uuidv4());

  const token = inject(AuthTokenStore).accessToken();
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const authReq = req.clone({
    headers,
    withCredentials: true
  });

  return next(authReq);
};
