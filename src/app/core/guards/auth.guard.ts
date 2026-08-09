import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session.store';
import { MeService } from '../services/me.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);
  const meService = inject(MeService);

  if (sessionStore.isAuthenticated()) {
    return true;
  }

  // Si no está autenticado en memoria, intentar recuperar la sesión
  // (la cookie de sesión de Laravel puede seguir válida tras un F5)
  try {
    await firstValueFrom(meService.fetchMe());
    // Si fetchMe fue exitoso, setSession ya fue llamado internamente
    if (sessionStore.isAuthenticated()) {
      return true;
    }
  } catch {
    // Si falla (401, etc.), la sesión realmente expiró
  }

  return router.createUrlTree(['/auth/login']);
};
