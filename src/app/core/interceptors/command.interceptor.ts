import { HttpInterceptorFn } from '@angular/common/http';

import { COMMAND_CONTEXT } from '@core/api/api-request.context';

export const commandInterceptor: HttpInterceptorFn = (request, next) => {
  const command = request.context.get(COMMAND_CONTEXT);
  const headers: Record<string, string> = {};

  if (command.idempotencyKey) {
    headers['Idempotency-Key'] = command.idempotencyKey;
  }

  if (command.ifMatch) {
    headers['If-Match'] = command.ifMatch;
  }

  return next(
    Object.keys(headers).length === 0
      ? request
      : request.clone({
          setHeaders: headers,
        }),
  );
};
