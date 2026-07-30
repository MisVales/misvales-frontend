import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, switchMap, tap, throwError } from 'rxjs';

import {
  CSRF_RETRY_PERFORMED,
  NETWORK_RETRY_PERFORMED,
  RETRY_GET_ONCE,
} from '@core/api/api-request.context';
import { ApiErrorBody, NormalizedApiError } from '@core/api/api-response.models';
import { CsrfService } from '@core/auth/csrf.service';
import { RequestSupportService } from '@core/error-handling/request-support.service';
import { SessionStore } from '@core/session/session.store';

const RETRYABLE_GET_STATUSES = new Set([0, 502, 503, 504]);
const MUTATION_METHODS = new Set(['DELETE', 'PATCH', 'POST', 'PUT']);

export const errorNormalizationInterceptor: HttpInterceptorFn = (request, next) => {
  const csrf = inject(CsrfService);
  const router = inject(Router);
  const session = inject(SessionStore);
  const support = inject(RequestSupportService);

  const send = (attempt: HttpRequest<unknown>): Observable<HttpEvent<unknown>> =>
    next(attempt).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          support.captureRequestId(event.headers.get('X-Request-Id'));
        }
      }),
      catchError((reason: unknown) => {
        if (!(reason instanceof HttpErrorResponse)) {
          return throwError(() => reason);
        }

        if (
          reason.status === 419 &&
          MUTATION_METHODS.has(attempt.method) &&
          !attempt.context.get(CSRF_RETRY_PERFORMED)
        ) {
          csrf.reset();
          return csrf.refresh().pipe(
            catchError((csrfReason: unknown) =>
              throwError(() =>
                normalizeError(
                  csrfReason instanceof HttpErrorResponse ? csrfReason : reason,
                  support,
                ),
              ),
            ),
            switchMap(() =>
              send(cloneForRetry(attempt, attempt.context.set(CSRF_RETRY_PERFORMED, true))),
            ),
          );
        }

        if (
          attempt.method === 'GET' &&
          attempt.context.get(RETRY_GET_ONCE) &&
          !attempt.context.get(NETWORK_RETRY_PERFORMED) &&
          RETRYABLE_GET_STATUSES.has(reason.status)
        ) {
          return send(cloneForRetry(attempt, attempt.context.set(NETWORK_RETRY_PERFORMED, true)));
        }

        if (reason.status === 401 || reason.status === 419) {
          session.clear();
          void router.navigate(['/acceso']);
        }

        return throwError(() => normalizeError(reason, support));
      }),
    );

  return send(request);
};

function cloneForRetry(request: HttpRequest<unknown>, context: HttpRequest<unknown>['context']) {
  const requestId = request.headers.has('X-Request-Id') ? crypto.randomUUID() : null;
  return request.clone({
    context,
    setHeaders: requestId ? { 'X-Request-Id': requestId } : {},
  });
}

function normalizeError(
  response: HttpErrorResponse,
  support: RequestSupportService,
): NormalizedApiError {
  const body = readApiError(response.error);
  const headerRequestId = response.headers.get('X-Request-Id');
  const requestId = body?.request_id ?? headerRequestId;
  const retryAfterSeconds = parseRetryAfter(response.headers.get('Retry-After'));

  support.captureRequestId(requestId);
  if (response.status === 429) {
    support.blockFor(retryAfterSeconds);
  }

  return {
    status: response.status,
    code: body?.code ?? statusCode(response.status),
    message: body?.message ?? readMessage(response.error) ?? defaultMessage(response.status),
    fields: body?.fields ?? {},
    details: {},
    request_id: requestId,
    retryAfterSeconds,
    offline: response.status === 0,
  };
}

function readApiError(value: unknown): ApiErrorBody | null {
  if (!isRecord(value) || !isRecord(value['error'])) {
    return null;
  }

  const error = value['error'];
  return {
    code: typeof error['code'] === 'string' ? error['code'] : 'API_ERROR',
    message: typeof error['message'] === 'string' ? error['message'] : 'Ocurrió un error.',
    fields: readFields(error['fields']),
    details: isRecord(error['details']) ? error['details'] : {},
    request_id: typeof error['request_id'] === 'string' ? error['request_id'] : null,
  };
}

function readMessage(value: unknown): string | null {
  return isRecord(value) && typeof value['message'] === 'string' ? value['message'] : null;
}

function readFields(value: unknown): Readonly<Record<string, readonly string[]>> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string[]] => Array.isArray(entry[1]))
      .map(([key, messages]) => [
        key,
        messages.filter((message): message is string => typeof message === 'string'),
      ]),
  );
}

function parseRetryAfter(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds;
  }

  const date = Date.parse(value);
  return Number.isNaN(date) ? null : Math.max(0, Math.ceil((date - Date.now()) / 1000));
}

function statusCode(status: number): string {
  return status === 0 ? 'NETWORK_UNCONFIRMED' : `HTTP_${status}`;
}

function defaultMessage(status: number): string {
  if (status === 0) {
    return 'No fue posible confirmar la operación. Revisa tu conexión.';
  }

  return 'Ocurrió un error al procesar la solicitud.';
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}
