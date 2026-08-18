import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';
import { AlertService } from '../../shared/services/alert.service';
import { MfaReauthService } from '../services/mfa-reauth.service';
import { AuthTokenStore } from '../session/auth-token.store';
import { SessionExpiredService } from '../session/session-expired.service';
import { SessionRefreshService } from '../session/session-refresh.service';
import { SessionStore } from '../session/session.store';

const PRODUCTION_SERVER_ERROR_MESSAGE = 'Ocurrió un error interno. Intenta nuevamente más tarde.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorCode(error: HttpErrorResponse): string | null {
  if (!isRecord(error.error)) return null;

  const nestedError = error.error['error'];
  if (isRecord(nestedError) && typeof nestedError['code'] === 'string') {
    return nestedError['code'];
  }

  return typeof error.error['code'] === 'string' ? error.error['code'] : null;
}

export function isConcurrencyConflict(error: HttpErrorResponse): boolean {
  if (error.status !== 409) return false;

  const code = errorCode(error);
  return code === 'CONCURRENT_REQUEST' || code === 'VERSION_CONFLICT' || code?.endsWith('_VERSION_CONFLICT') === true;
}

export function shouldEndSessionForHttpStatus(status: number): boolean {
  return status === 401 || status === 419;
}

export function sanitizeServerError(error: HttpErrorResponse, developmentMode: boolean): HttpErrorResponse {
  if (developmentMode || error.status < 500) {
    return error;
  }

  return new HttpErrorResponse({
    error: { message: PRODUCTION_SERVER_ERROR_MESSAGE },
    headers: error.headers,
    status: error.status,
    statusText: error.statusText,
    url: error.url ?? undefined,
  });
}

export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionStore = inject(SessionStore);
  const mfaReauthService = inject(MfaReauthService);
  const alertService = inject(AlertService);
  const tokenStore = inject(AuthTokenStore);
  const sessionExpired = inject(SessionExpiredService);
  const sessionRefresh = inject(SessionRefreshService);

  const endExpiredSession = (error: HttpErrorResponse): Observable<never> => {
    tokenStore.clear();
    sessionStore.clearSession();
    sessionExpired.open();
    return throwError(() => sanitizeServerError(error, isDevMode()));
  };

  function handleError(
    error: HttpErrorResponse,
    request: HttpRequest<unknown>,
    allowRefresh: boolean,
  ): Observable<HttpEvent<unknown>> {
    if (isDevMode()) {
      console.error('HTTP request failed', error);
    }

    if (error.status === 403 && isRecord(error.error) && error.error['mfa_required'] === true) {
      return from(mfaReauthService.requestMfaCode()).pipe(
        switchMap((totpCode) => {
          const body = isRecord(request.body) ? request.body : {};
          return next(request.clone({ body: { ...body, totp_code: totpCode } }));
        }),
        catchError(() => throwError(() => error)),
      );
    }

    const isSecurityAuthEndpoint =
      request.url.includes('/me/security/password') ||
      request.url.includes('/me/security/totp/') ||
      request.url.includes('/me/security/recovery-codes');
    const isCsrfEndpoint = request.url.includes('/sanctum/csrf-cookie');
    const isAuthEndpoint =
      (request.url.includes('/auth/') && !request.url.includes('/logout')) ||
      isSecurityAuthEndpoint ||
      isCsrfEndpoint;

    const canRetryAfterRefresh =
      allowRefresh &&
      error.status === 401 &&
      !isAuthEndpoint &&
      !request.headers.has('X-Session-Retry') &&
      (request.method === 'GET' || request.method === 'HEAD');

    if (canRetryAfterRefresh) {
      return sessionRefresh.refresh().pipe(
        catchError(() => endExpiredSession(error)),
        switchMap(() => {
          const accessToken = tokenStore.accessToken();
          if (!accessToken) {
            return endExpiredSession(error);
          }

          const retryRequest = request.clone({
            headers: request.headers
              .set('Authorization', `Bearer ${accessToken}`)
              .set('X-Session-Retry', '1'),
          });

          return next(retryRequest).pipe(
            catchError((retryError: HttpErrorResponse) =>
              handleError(retryError, retryRequest, false),
            ),
          );
        }),
      );
    }

    if (!isAuthEndpoint && shouldEndSessionForHttpStatus(error.status)) {
      return endExpiredSession(error);
    }

    if (!isAuthEndpoint && error.status === 403) {
      alertService.showAlert('No tiene permiso para realizar esta acción.', 'error', 6000);
    } else if (isConcurrencyConflict(error)) {
      alertService.showAlert(
        'La información cambió mientras trabajaba. Recargue los datos e inténtelo de nuevo.',
        'error',
        7000,
      );
    } else if (error.status === 429) {
      const retryAfter = error.headers.get('Retry-After');
      const suffix = retryAfter
        ? ` Inténtelo nuevamente en ${retryAfter} segundos.`
        : ' Inténtelo nuevamente más tarde.';
      alertService.showAlert(`Se alcanzó el límite de solicitudes.${suffix}`, 'error', 7000);
    } else if (error.status === 0) {
      alertService.showAlert(
        'No fue posible conectar con el servidor. Tus cambios actuales continúan en pantalla.',
        'error',
        7000,
      );
    } else if (error.status >= 500) {
      alertService.showAlert(
        'No se pudo completar la operación. Tus datos capturados no se han eliminado.',
        'error',
        7000,
      );
    }

    return throwError(() => sanitizeServerError(error, isDevMode()));
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => handleError(error, req, true)),
  );
};
