import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { RequestActivityService } from '../observability/request-activity.service';
import { RequestCorrelationService } from '../observability/request-correlation.service';

export const SKIP_GLOBAL_LOADING = new HttpContextToken<boolean>(() => false);

export const requestActivityInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.context.get(SKIP_GLOBAL_LOADING)) {
    return next(request);
  }

  const activity = inject(RequestActivityService);
  if (activity.pendingCount() === 0) {
    inject(RequestCorrelationService).beginActivity();
  }
  const complete = activity.begin();

  return next(request).pipe(finalize(complete));
};
