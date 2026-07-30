import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { INTERNAL_API_REQUEST } from '@core/api/api-request.context';
import { APP_CONFIG } from '@core/config/app-config.token';

const ABSOLUTE_URL = /^[a-z][a-z\d+\-.]*:/i;

export const apiUrlInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.context.get(INTERNAL_API_REQUEST) || ABSOLUTE_URL.test(request.url)) {
    return next(request);
  }

  const baseUrl = inject(APP_CONFIG).apiBaseUrl;
  const path = request.url.startsWith('/') ? request.url : `/${request.url}`;
  const url = path.startsWith(`${baseUrl}/`) || path === baseUrl ? path : `${baseUrl}${path}`;

  return next(request.clone({ url }));
};
