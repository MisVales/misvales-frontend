import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { AuthService } from '../data-access/auth.service';
import { SessionStore } from '@core/session/session.store';
import { LoginReq, MfaReq, RecoverReq } from '../data-access/auth.dtos';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthState {
  isLoading: boolean;
  error: string | null;
  requiresMfa: boolean;
}

const initialAuthState: AuthState = {
  isLoading: false,
  error: null,
  requiresMfa: false,
};

export const AuthFacade = signalStore(
  { providedIn: 'root' },
  withState(initialAuthState),
  withMethods((store) => {
    const authService = inject(AuthService);
    const sessionStore = inject(SessionStore);
    const router = inject(Router);

    return {
      async login(credentials: LoginReq) {
        patchState(store, { isLoading: true, error: null });
        try {
          // Si es necesario: await firstValueFrom(authService.getCsrfCookie());
          const response = await firstValueFrom(authService.login(credentials));
          
          if (response.requiresMfa) {
            patchState(store, { requiresMfa: true, isLoading: false });
          } else if (response.user) {
            sessionStore.setSession(
              { id: response.user.id, name: response.user.name, email: response.user.email },
              response.user.roles,
              response.user.permissions,
              null
            );
            if (response.token) {
              localStorage.setItem('token', response.token);
            }
            patchState(store, { isLoading: false });
            router.navigate(['/']); // Go to dashboard
          }
        } catch (err: any) {
          patchState(store, { isLoading: false, error: err?.error?.message || 'Error al iniciar sesión' });
        }
      },

      async verifyMfa(data: MfaReq) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(authService.verifyMfa(data));
          if (response.user) {
            sessionStore.setSession(
              { id: response.user.id, name: response.user.name, email: response.user.email },
              response.user.roles,
              response.user.permissions,
              null
            );
            if (response.token) {
              localStorage.setItem('token', response.token);
            }
            patchState(store, { isLoading: false, requiresMfa: false });
            router.navigate(['/']);
          }
        } catch (err: any) {
          patchState(store, { isLoading: false, error: 'Código MFA inválido' });
        }
      },

      async recoverAccess(data: RecoverReq) {
        patchState(store, { isLoading: true, error: null });
        try {
          await firstValueFrom(authService.recoverAccess(data));
          patchState(store, { isLoading: false });
          // Redirigir a una página de éxito o mostrar mensaje
        } catch (err: any) {
          patchState(store, { isLoading: false, error: 'Error al recuperar acceso' });
        }
      },
      
      resetState() {
        patchState(store, initialAuthState);
      }
    };
  })
);
