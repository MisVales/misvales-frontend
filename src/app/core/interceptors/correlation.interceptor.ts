import { HttpInterceptorFn } from '@angular/common/http';

import { CORRELATION_CONTEXT } from '@core/api/api-request.context';

export const correlationInterceptor: HttpInterceptorFn = (request, next) => {
  const correlation = request.context.get(CORRELATION_CONTEXT);
  const headers: Record<string, string> = {};

  if (correlation.requestId) {
    headers['X-Request-Id'] = crypto.randomUUID();
  }

  if (correlation.traceId) {
    headers['X-Trace-Id'] = correlation.traceId;
  }

  return next(
    Object.keys(headers).length === 0
      ? request
      : request.clone({
          setHeaders: headers,
        }),
  );
};
