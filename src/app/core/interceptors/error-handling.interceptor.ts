import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AlertService } from '../../shared/services/alert.service';
import { MfaReauthService } from '../services/mfa-reauth.service';
import { SessionStore } from '../session/session.store';
import { AuthTokenStore } from '../session/auth-token.store';
import { SessionRefreshService } from '../session/session-refresh.service';

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
  const router = inject(Router);
  const mfaReauthService = inject(MfaReauthService);
  const alertService = inject(AlertService);
  const tokenStore = inject(AuthTokenStore);
  const sessionRefresh = inject(SessionRefreshService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isDevMode()) {
        console.error('HTTP request failed', error);
      }

      if (error.status === 403 && isRecord(error.error) && error.error['mfa_required'] === true) {
        return from(mfaReauthService.requestMfaCode()).pipe(
          switchMap((totpCode) => {
            const body = isRecord(req.body) ? req.body : {};
            return next(req.clone({ body: { ...body, totp_code: totpCode } }));
          }),
          catchError(() => throwError(() => error)),
        );
      }

      const isSecurityAuthEndpoint =
        req.url.includes('/me/security/password') ||
        req.url.includes('/me/security/totp/') ||
        req.url.includes('/me/security/recovery-codes');
      const isAuthEndpoint = (req.url.includes('/auth/') && !req.url.includes('/logout')) || isSecurityAuthEndpoint;

      const canRetryAfterRefresh =
        error.status === 401 &&
        !isAuthEndpoint &&
        !req.headers.has('X-Session-Retry') &&
        (req.method === 'GET' || req.method === 'HEAD');

      if (canRetryAfterRefresh) {
        return sessionRefresh.refresh().pipe(
          switchMap(() => {
            const accessToken = tokenStore.accessToken();
            if (!accessToken) return throwError(() => error);

            return next(
              req.clone({
                headers: req.headers
                  .set('Authorization', `Bearer ${accessToken}`)
                  .set('X-Session-Retry', '1'),
              }),
            );
          }),
          catchError(() => {
            tokenStore.clear();
            sessionStore.clearSession();
            alertService.showAlert('Su sesión ha expirado. Por favor, vuelva a iniciar sesión.', 'error', 6000);
            void router.navigate(['/auth/login']);
            return throwError(() => error);
          }),
        );
      }

      if (!isAuthEndpoint && shouldEndSessionForHttpStatus(error.status)) {
        tokenStore.clear();
        sessionStore.clearSession();
        alertService.showAlert('Su sesión ha expirado. Por favor, vuelva a iniciar sesión.', 'error', 6000);
        void router.navigate(['/auth/login']);
      } else if (!isAuthEndpoint && error.status === 403) {
        alertService.showAlert('No tiene permiso para realizar esta acción.', 'error', 6000);
      } else if (isConcurrencyConflict(error)) {
        alertService.showAlert('La información cambió mientras trabajaba. Recargue los datos e inténtelo de nuevo.', 'error', 7000);
      } else if (error.status === 429) {
        const retryAfter = error.headers.get('Retry-After');
        const suffix = retryAfter ? ` Inténtelo nuevamente en ${retryAfter} segundos.` : ' Inténtelo nuevamente más tarde.';
        alertService.showAlert(`Se alcanzó el límite de solicitudes.${suffix}`, 'error', 7000);
      } else if (error.status === 0) {
        alertService.showAlert('No fue posible conectar con el servidor. Tus cambios actuales continúan en pantalla.', 'error', 7000);
      } else if (error.status >= 500) {
        alertService.showAlert('No se pudo completar la operación. Tus datos capturados no se han eliminado.', 'error', 7000);
      }

      return throwError(() => sanitizeServerError(error, isDevMode()));
    }),
  );
};
