import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { RequestCorrelationService } from '../observability/request-correlation.service';
import { AuthTokenStore } from '../session/auth-token.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const correlation = inject(RequestCorrelationService);
  let headers = req.headers
    .set('X-Request-Id', correlation.nextRequestId())
    .set('X-Correlation-Id', correlation.correlationId());

  const token = inject(AuthTokenStore).accessToken();
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const authReq = req.clone({
    headers,
    withCredentials: true,
  });

  return next(authReq);
};
