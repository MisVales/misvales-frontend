import { HttpInterceptorFn, HttpXsrfTokenExtractor } from '@angular/common/http';
import { inject } from '@angular/core';
import { RequestCorrelationService } from '../observability/request-correlation.service';
import { AuthTokenStore } from '../session/auth-token.store';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const correlation = inject(RequestCorrelationService);
  const xsrfTokenExtractor = inject(HttpXsrfTokenExtractor);

  let headers = req.headers
    .set('X-Request-Id', correlation.nextRequestId())
    .set('X-Correlation-Id', correlation.correlationId());

  const token = inject(AuthTokenStore).accessToken();
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  // Angular's built-in XSRF interceptor skips cross-origin requests.
  // Manually attach the token for mutating methods to support
  // frontend (safeacces.lat) → API (api.safeacces.lat) flows.
  if (MUTATING_METHODS.has(req.method) && !headers.has('X-XSRF-TOKEN')) {
    const xsrfToken = xsrfTokenExtractor.getToken();
    if (xsrfToken) {
      headers = headers.set('X-XSRF-TOKEN', xsrfToken);
    }
  }

  const authReq = req.clone({
    headers,
    withCredentials: true,
  });

  return next(authReq);
};
