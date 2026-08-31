import {
  HttpErrorResponse,
  HttpEvent,
  HttpContextToken,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';
import { apiErrorCode, normalizeApiError } from '../api/api-error';
import { AlertService } from '../../shared/components/alerts/alert.service';
import { MfaReauthService } from '@core/auth/services/mfa-reauth.service';
import { AuthTokenStore } from '../session/auth-token.store';
import { SessionExpiredService } from '../session/session-expired.service';
import { SessionRefreshService } from '../session/session-refresh.service';
import { SessionStore } from '../session/session.store';
import { OfflineSyncService } from '@core/api/offline/offline-sync.service';
import { runtimeDebugEnabled } from '@core/auth/data-access/auth-configuration.service';

const PRODUCTION_SERVER_ERROR_MESSAGE = 'Ocurrió un error interno. Intenta nuevamente más tarde.';
const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{8,128}$/;

/** Requests with their own inline error state should not duplicate a global toast. */
export const SKIP_GLOBAL_ALERT = new HttpContextToken<boolean>(() => false);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requestReference(error: HttpErrorResponse): string {
  const requestId = normalizeApiError(error).requestId;
  if (!requestId || !SAFE_REQUEST_ID.test(requestId)) return '';

  const supportCode = requestId
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 10)
    .toUpperCase();
  return supportCode.length >= 8 ? ` Folio de soporte: ${supportCode}.` : '';
}

export function isConcurrencyConflict(error: HttpErrorResponse): boolean {
  if (error.status === 412) return true;
  if (error.status !== 409) return false;

  const code = apiErrorCode(error, '');
  return (
    code === 'CONCURRENT_REQUEST' ||
    code === 'VERSION_CONFLICT' ||
    code?.endsWith('_VERSION_CONFLICT') === true
  );
}

export function shouldEndSessionForHttpStatus(status: number): boolean {
  return status === 401 || status === 419;
}

export function sanitizeServerError(
  error: HttpErrorResponse,
  developmentMode: boolean,
): HttpErrorResponse {
  if (developmentMode || error.status < 500) {
    return error;
  }

  const normalized = normalizeApiError(error);
  return new HttpErrorResponse({
    error: {
      code: 'SERVER_ERROR',
      message: PRODUCTION_SERVER_ERROR_MESSAGE,
      request_id: normalized.requestId,
    },
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
  const router = inject(Router);
  const offlineSync = inject(OfflineSyncService);

  const endExpiredSession = (error: HttpErrorResponse): Observable<never> => {
    tokenStore.clear();
    sessionStore.clearSession();
    sessionExpired.close();
    void router.navigate(['/auth/login'], { replaceUrl: true });
    return throwError(() => sanitizeServerError(error, isDevMode()));
  };

  function handleError(
    error: HttpErrorResponse,
    request: HttpRequest<unknown>,
    allowRefresh: boolean,
  ): Observable<HttpEvent<unknown>> {
    const skipGlobalAlert = request.context.get(SKIP_GLOBAL_ALERT);

    if (isDevMode() || runtimeDebugEnabled()) {
      const normalized = normalizeApiError(error);
      console.error('[MisVales HTTP]', {
        method: request.method,
        url: request.url.split('?')[0],
        status: error.status,
        code: normalized.code,
        message: normalized.message,
        requestId: normalized.requestId,
        details: normalized.details,
      });
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
      !request.headers.has('X-Session-Retry');

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

    if (error.status === 403) {
      if (apiErrorCode(error, '') === 'VPN_REQUIRED') {
        sessionStore.setManagerAccess(false, false);
        if (!skipGlobalAlert) {
          alertService.showAlert(
            'Conéctate a la VPN para realizar acciones gerenciales. Tu sesión sigue activa.',
            'error',
            7000,
          );
        }
        return throwError(() => sanitizeServerError(error, isDevMode()));
      }
      if (!skipGlobalAlert) {
        alertService.showAlert(
          'No tienes autorización para realizar esta acción. Tu sesión sigue activa.',
          'error',
          7000,
        );
      }
    } else if (!skipGlobalAlert && error.status === 404) {
      alertService.showAlert(
        'El recurso solicitado ya no existe o no está disponible.',
        'error',
        6000,
      );
    } else if (!skipGlobalAlert && isConcurrencyConflict(error)) {
      alertService.showAlert(
        'La información cambió mientras trabajaba. Recargue los datos e inténtelo de nuevo.',
        'error',
        7000,
      );
    } else if (!skipGlobalAlert && error.status === 429) {
      const retryAfter = error.headers.get('Retry-After');
      const suffix = retryAfter
        ? ` Inténtelo nuevamente en ${retryAfter} segundos.`
        : ' Inténtelo nuevamente más tarde.';
      alertService.showAlert(`Se alcanzó el límite de solicitudes.${suffix}`, 'error', 7000);
    } else if (!skipGlobalAlert && error.status === 0) {
      alertService.showAlert(
        'No fue posible conectar con el servidor. Tus cambios actuales continúan en pantalla.',
        'error',
        7000,
      );
    } else if (
      !skipGlobalAlert &&
      (error.status === 502 || error.status === 503 || error.status === 504)
    ) {
      alertService.showAlert(
        `El servicio no está disponible temporalmente. Intenta nuevamente.${requestReference(error)}`,
        'error',
        7000,
      );
    }

    return throwError(() => sanitizeServerError(error, isDevMode()));
  }

  return next(req).pipe(catchError((error: HttpErrorResponse) => handleError(error, req, true)));
};
