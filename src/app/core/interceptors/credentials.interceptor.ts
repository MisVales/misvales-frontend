import { HttpInterceptorFn } from '@angular/common/http';

const SAME_ORIGIN_PRIVATE_PATH = /^\/(?:api\/v1(?:\/|$)|sanctum(?:\/|$))/;

export const credentialsInterceptor: HttpInterceptorFn = (request, next) => {
  if (!SAME_ORIGIN_PRIVATE_PATH.test(request.url)) {
    return next(request);
  }

  return next(
    request.clone({
      withCredentials: true,
      setHeaders: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    }),
  );
};
