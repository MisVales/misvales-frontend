import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session.store';
import { MeService } from '../services/me.service';
import { firstValueFrom } from 'rxjs';
import { AuthTokenStore } from '../session/auth-token.store';
import { SessionRefreshService } from '../session/session-refresh.service';
import { HttpErrorResponse } from '@angular/common/http';

export const authGuard: CanActivateFn = async (route, state) => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);
  const meService = inject(MeService);
  const tokenStore = inject(AuthTokenStore);
  const sessionRefresh = inject(SessionRefreshService);

  if (sessionStore.isAuthenticated()) {
    return true;
  }

  try {
    if (!tokenStore.accessToken()) {
      await firstValueFrom(sessionRefresh.refresh());
    }
    await firstValueFrom(meService.fetchMe());
    if (sessionStore.isAuthenticated()) {
      return true;
    }
  } catch (error) {
    if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 419)) {
      tokenStore.clear();
      sessionStore.clearSession();
    } else {
      return router.createUrlTree(['/servicio-no-disponible']);
    }
  }

  return router.createUrlTree(['/auth/login']);
};
