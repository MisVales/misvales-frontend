import { HttpInterceptorFn, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, from } from 'rxjs';
import { SessionStore } from '../session/session.store';
import { MfaReauthService } from '../services/mfa-reauth.service';
import { AlertService } from '../../shared/services/alert.service';

const PRODUCTION_SERVER_ERROR_MESSAGE = 'Ocurrió un error interno. Intenta nuevamente más tarde.';

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
  const http = inject(HttpClient);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isDevMode()) {
        console.error('HTTP Error occurred:', error);
      }
      
      // Manejo de Reautenticación MFA (Zero Trust)
      if (error.status === 403 && error.error?.mfa_required === true) {
        return from(mfaReauthService.requestMfaCode()).pipe(
          switchMap((totp_code) => {
            // Clonar la petición añadiendo el totp_code al body
            // Asumimos que es un POST, PUT, PATCH, o DELETE con body. Si es GET, se podría enviar por query param, pero suele ser body.
            const newBody = { ...(req.body as any), totp_code };
            const clonedReq = req.clone({ body: newBody });
            
            // Re-ejecutar la petición clonada
            // NOTA: next(clonedReq) ejecuta toda la cadena de interceptores desde aquí hacia adelante
            return next(clonedReq);
          }),
          catchError((err) => {
            // Si el usuario canceló el modal u ocurre otro error en el reintento, lanzamos el error original
            console.error('MFA Reauth cancelled or failed:', err);
            return throwError(() => error);
          })
        );
      }

      const isSecurityAuthEndpoint = req.url.includes('/me/security/password') || req.url.includes('/me/security/totp/') || req.url.includes('/me/security/recovery-codes');
      const isAuthEndpoint = (req.url.includes('/auth/') && !req.url.includes('/logout')) || isSecurityAuthEndpoint;

      if (!isAuthEndpoint && (error.status === 401 || error.status === 419 || (error.status === 403 && error.error?.mfa_required !== true))) {
        // 401: Unauthorized, 403: Forbidden (General), 419: Page Expired (CSRF)
        sessionStore.clearSession();
        alertService.showAlert('Su sesión ha expirado. Por favor, vuelva a iniciar sesión.', 'error', 6000);
        router.navigate(['/auth/login']);
      }

      return throwError(() => sanitizeServerError(error, isDevMode()));
    })
  );
};
