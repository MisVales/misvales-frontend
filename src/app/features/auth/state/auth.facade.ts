import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { AuthService } from '../data-access/auth.service';
import { SessionStore } from '@core/session/session.store';
import { MeService } from '@core/services/me.service';
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

function mapErrorCodeToMessage(code: string, fallback: string): string {
  const dictionary: Record<string, string> = {
    'AUTH_INVALID_CREDENTIALS': 'El correo o contraseña son incorrectos.',
    'AUTH_USER_BLOCKED': 'Esta cuenta ha sido bloqueada. Contacte a soporte.',
    'AUTH_SCOPE_DENIED': 'No tiene permisos para acceder a esta área.',
    'MFA_INVALID': 'El código de autenticación es incorrecto.',
    'AUTH_ERROR': 'Ocurrió un error al intentar iniciar sesión. Por favor, intente de nuevo.',
    'RECOVERY_ERROR': 'El código de recuperación es incorrecto.'
  };
  return dictionary[code] || fallback;
}


export const AuthFacade = signalStore(
  { providedIn: 'root' },
  withState(initialAuthState),
  withMethods((store) => {
    const authService = inject(AuthService);
    const sessionStore = inject(SessionStore);
    const meService = inject(MeService);
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
            await firstValueFrom(meService.fetchMe());
            patchState(store, { isLoading: false });
            router.navigate(['/']); // Go to dashboard
          }
        } catch (err: any) {
          const code = err?.error?.code || 'AUTH_ERROR';
          const fallback = err?.error?.message || 'Error al iniciar sesión';
          patchState(store, { isLoading: false, error: mapErrorCodeToMessage(code, fallback) });
        }
      },

      async loginWithPasskey() {
        patchState(store, { isLoading: true, error: null });
        try {
          // 1. Get challenge from server
          const challenge = await firstValueFrom(authService.getWebAuthnChallenge());
          
          // 2. Simulamos la llamada a navigator.credentials.get (Passkey real)
          // const credential = await navigator.credentials.get({ publicKey: challenge.publicKey });
          const credential = { id: 'mock-passkey-id', rawId: 'mock-passkey-id', type: 'public-key' }; // MOCK
          
          // 3. Send response to server via login
          const response = await firstValueFrom(authService.login({ webauthnResponse: credential }));
          
          if (response.requiresMfa) {
            patchState(store, { requiresMfa: true, isLoading: false });
          } else if (response.user) {
            await firstValueFrom(meService.fetchMe());
            patchState(store, { isLoading: false });
            router.navigate(['/']); // Go to dashboard
          }
        } catch (err: any) {
          const code = err?.error?.code || 'AUTH_ERROR';
          const fallback = err?.error?.message || 'Error al iniciar sesión con Passkey';
          patchState(store, { isLoading: false, error: mapErrorCodeToMessage(code, fallback) });
        }
      },

      async verifyMfa(data: MfaReq) {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(authService.verifyMfa(data));
          if (response.user) {
            await firstValueFrom(meService.fetchMe());
            patchState(store, { isLoading: false, requiresMfa: false });
            router.navigate(['/']);
          }
        } catch (err: any) {
          const code = err?.error?.code || 'MFA_INVALID';
          const fallback = err?.error?.message || 'Código MFA inválido';
          patchState(store, { isLoading: false, error: mapErrorCodeToMessage(code, fallback) });
        }
      },

      async recoverAccess(data: RecoverReq) {
        patchState(store, { isLoading: true, error: null });
        try {
          await firstValueFrom(authService.recoverAccess(data));
          patchState(store, { isLoading: false });
          // Redirigir a una página de éxito o mostrar mensaje
        } catch (err: any) {
          const code = err?.error?.code || 'RECOVERY_ERROR';
          const fallback = err?.error?.message || 'Error al recuperar acceso';
          patchState(store, { isLoading: false, error: mapErrorCodeToMessage(code, fallback) });
        }
      },

      async logout() {
        patchState(store, { isLoading: true, error: null });
        try {
          await firstValueFrom(authService.logout());
        } catch (err: any) {
          console.warn('Logout API error:', err);
        } finally {
          sessionStore.clearSession();
          patchState(store, initialAuthState);
          router.navigate(['/auth/login']);
        }
      },
      
      resetState() {
        patchState(store, initialAuthState);
      }
    };
  })
);
