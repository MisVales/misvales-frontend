import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_CONFIG } from '../api/api.config';
import { RequestCorrelationService } from '../observability/request-correlation.service';
import { RealtimeSocketStore } from '../realtime/realtime-socket.store';
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

  const socketId = inject(RealtimeSocketStore).socketId();
  if (socketId && isApiRequest(req.url, inject(API_CONFIG).baseUrl)) {
    headers = headers.set('X-Socket-ID', socketId);
  }

  const authReq = req.clone({
    headers,
    withCredentials: true,
  });

  return next(authReq);
};

function isApiRequest(requestUrl: string, apiBaseUrl: string): boolean {
  try {
    const request = new URL(requestUrl, document.baseURI);
    const api = new URL(apiBaseUrl, document.baseURI);
    const apiRoot = api.pathname.match(/^.*\/api(?:\/|$)/)?.[0] ?? api.pathname;

    return request.origin === api.origin && request.pathname.startsWith(apiRoot);
  } catch {
    return requestUrl.startsWith('/api/');
  }
}
