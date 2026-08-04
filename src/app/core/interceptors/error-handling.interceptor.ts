import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionStore } from '../session/session.store';

export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error occurred:', error);
      
      if (error.status === 401 || error.status === 403 || error.status === 419) {
        // 401: Unauthorized, 403: Forbidden, 419: Page Expired (CSRF)
        sessionStore.clearSession();
        localStorage.removeItem('token'); // In case it's used
        
        // Redirect to login, optionally passing current URL for returnUrl
        router.navigate(['/login']);
      }

      // Custom error handling logic can be expanded here
      return throwError(() => error);
    })
  );
};
