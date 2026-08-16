import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session.store';
import { MeService } from '../services/me.service';
import { firstValueFrom } from 'rxjs';
import { AuthTokenStore } from '../session/auth-token.store';
import { SessionRefreshService } from '../session/session-refresh.service';

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
  } catch {
    tokenStore.clear();
    sessionStore.clearSession();
  }

  return router.createUrlTree(['/auth/login']);
};
