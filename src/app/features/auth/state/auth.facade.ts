import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { AuthService } from '../data-access/auth.service';
import { SessionStore } from '@core/session/session.store';
import { MeService } from '@core/services/me.service';
import { LoginReq, MfaReq, RecoverReq, ResetPwdReq, SetupInvitationReq } from '../data-access/auth.dtos';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export interface AuthState {
  isLoading: boolean;
  error: string | null;
  mfaChallengeToken: string | null;
  availableMfa: string[];
  mfaStep: 'totp' | 'passkey';
  mfaExpiresAt: number | null;
  activationPhase: number;
  activationExchangeToken: string | null;
  activationUser: { name: string; email: string; roles?: string[] } | null;
  activationQrCode: string | null;
  activationTotpSecret: string | null;
  activationRecoveryCodes: string[] | null;
}

const initialAuthState: AuthState = {
  isLoading: false,
  error: null,
  mfaChallengeToken: null,
  availableMfa: [],
  mfaStep: 'totp',
  mfaExpiresAt: null,
  activationPhase: 0,
  activationExchangeToken: null,
  activationUser: null,
  activationQrCode: null,
  activationTotpSecret: null,
  activationRecoveryCodes: null,
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
          const response = await firstValueFrom(authService.login(credentials));
          
          if (response.mfa_challenge_token) {
            patchState(store, { 
              mfaChallengeToken: response.mfa_challenge_token, 
              availableMfa: response.available_mfa || [],
              mfaStep: 'totp',
              mfaExpiresAt: response.expires_in ? Date.now() + response.expires_in * 1000 : null,
              isLoading: false 
            });
            router.navigate(['/auth/totp']);
          } else if (response.access_token) {
            await firstValueFrom(meService.fetchMe());
            patchState(store, { isLoading: false });
            router.navigate(['/']); // Go to dashboard
          }
        } catch (err: any) {
          const code = err?.error?.error || 'AUTH_ERROR';
          const fallback = err?.error?.message || 'Error al iniciar sesión';
          patchState(store, { isLoading: false, error: mapErrorCodeToMessage(code, fallback) });
        }
      },

      async verifyPasskeyMfa() {
        patchState(store, { isLoading: true, error: null });
        try {
          const token = store.mfaChallengeToken();
          if (!token) throw new Error('No MFA challenge token found');

          // 1. Opciones
          const responseOptions = await firstValueFrom(authService.getPasskeyOptions({ mfa_challenge_token: token }));
          const options = responseOptions.options || responseOptions.data || responseOptions;
          console.log('Passkey Options received:', options);
          
          // 2. startAuthentication
          let attResp;
          try {
            attResp = await startAuthentication({ optionsJSON: options });
          } catch (error: any) {
            console.error('startAuthentication error:', error);
            patchState(store, { isLoading: false, error: error.message || 'Error al iniciar el prompt de Passkey. Verifica la consola.' });
            return;
          }

          // 3. Verify
          const response = await firstValueFrom(authService.verifyPasskey({
            mfa_challenge_token: token,
            id: attResp.id,
            clientDataJSON: (attResp.response as any).clientDataJSON,
            authenticatorData: (attResp.response as any).authenticatorData,
            signature: (attResp.response as any).signature
          }));

          if (response.access_token) {
            await firstValueFrom(meService.fetchMe());
            patchState(store, { isLoading: false, mfaChallengeToken: null, availableMfa: [] });
            router.navigate(['/']);
          }
        } catch (err: any) {
          const code = err?.error?.error;
          const fallback = err?.error?.message || 'Error al autenticar con Passkey';
          
          if (code === 'EXPIRED_MFA_CHALLENGE') {
            alert(fallback);
            patchState(store, initialAuthState);
            router.navigate(['/auth/login']);
          } else {
            patchState(store, { isLoading: false, error: fallback });
          }
        }
      },

      async verifyMfa(data: Omit<MfaReq, 'mfa_challenge_token'>) {
        patchState(store, { isLoading: true, error: null });
        try {
          const token = store.mfaChallengeToken();
          if (!token) throw new Error('No MFA challenge token found');

          const response = await firstValueFrom(authService.verifyMfa({ ...data, mfa_challenge_token: token }));
          
          if (response.next_step === 'PASSKEY') {
            patchState(store, { 
              isLoading: false, 
              mfaStep: 'passkey',
              mfaChallengeToken: response.mfa_challenge_token || token,
              mfaExpiresAt: response.expires_in ? Date.now() + response.expires_in * 1000 : store.mfaExpiresAt()
            });
          } else if (response.access_token) {
            await firstValueFrom(meService.fetchMe());
            patchState(store, { isLoading: false, mfaChallengeToken: null, availableMfa: [] });
            router.navigate(['/']);
          }
        } catch (err: any) {
          const code = err?.error?.error || 'MFA_INVALID';
          const fallback = err?.error?.message || 'Código MFA inválido';
          
          if (code === 'EXPIRED_MFA_CHALLENGE') {
            alert(fallback);
            patchState(store, initialAuthState);
            router.navigate(['/auth/login']);
          } else {
            patchState(store, { isLoading: false, error: mapErrorCodeToMessage(code, fallback) });
          }
        }
      },

      async recoverAccess(data: RecoverReq): Promise<boolean> {
        patchState(store, { isLoading: true, error: null });
        try {
          await firstValueFrom(authService.recoverAccess(data));
          patchState(store, { isLoading: false });
          return true;
        } catch (err: any) {
          const code = err?.error?.code || 'RECOVERY_ERROR';
          const fallback = err?.error?.message || 'Error al recuperar acceso';
          patchState(store, { isLoading: false, error: mapErrorCodeToMessage(code, fallback) });
          return false;
        }
      },

      async resetPassword(data: ResetPwdReq): Promise<boolean> {
        patchState(store, { isLoading: true, error: null });
        try {
          await firstValueFrom(authService.resetPassword(data));
          patchState(store, { isLoading: false });
          return true;
        } catch (err: any) {
          const code = err?.error?.code || 'RESET_ERROR';
          const fallback = err?.error?.message || 'Error al restablecer la contraseña';
          patchState(store, { isLoading: false, error: mapErrorCodeToMessage(code, fallback) });
          return false;
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

      async inspectInvitation(token: string) {
        if (store.isLoading() || store.activationPhase() > 0) return; // Prevent double firing in Strict Mode
        patchState(store, { isLoading: true, error: null, activationPhase: 0 });
        try {
          const res = await firstValueFrom(authService.inspectInvitation({ token }));
          patchState(store, {
            isLoading: false,
            activationPhase: res.step === 'passkey' ? 3 : 1,
            activationExchangeToken: res.exchange_token,
            activationUser: res.user,
            activationQrCode: res.totp_setup?.qr_code_url || null,
            activationTotpSecret: res.totp_setup?.secret || res.totp_setup?.secret_key || null
          });
        } catch (err: any) {
          const code = err?.error?.error || 'INVALID_INVITATION';
          const fallback = err?.error?.message || 'Enlace inválido o expirado';
          patchState(store, { isLoading: false, error: mapErrorCodeToMessage(code, fallback) });
        }
      },

      async setupInvitation(data: Omit<SetupInvitationReq, 'exchange_token'>) {
        patchState(store, { isLoading: true, error: null });
        try {
          const exchange_token = store.activationExchangeToken();
          if (!exchange_token) throw new Error('No exchange token');

          const res = await firstValueFrom(authService.setupInvitation({ ...data, exchange_token }));
          patchState(store, {
            isLoading: false,
            activationPhase: 2,
            activationRecoveryCodes: res.recovery_codes
          });
        } catch (err: any) {
          const code = err?.error?.error || 'SETUP_ERROR';
          const fallback = err?.error?.message || 'Error al configurar cuenta';
          patchState(store, { isLoading: false, error: mapErrorCodeToMessage(code, fallback) });
        }
      },

      async completeInvitation() {
        patchState(store, { isLoading: true, error: null });
        try {
          const exchange_token = store.activationExchangeToken();
          if (!exchange_token) throw new Error('No exchange token');

          await firstValueFrom(authService.completeInvitation({ exchange_token, codes_safeguarded: true }));
          patchState(store, { isLoading: false, activationPhase: 4 });
        } catch (err: any) {
          const code = err?.error?.error || 'COMPLETE_ERROR';
          const fallback = err?.error?.message || 'Error al completar activación';
          patchState(store, { isLoading: false, error: mapErrorCodeToMessage(code, fallback) });
        }
      },

      proceedToPasskeys() {
        patchState(store, { activationPhase: 3 });
      },

      async registerPasskey() {
        patchState(store, { isLoading: true, error: null });
        try {
          const exchange_token = store.activationExchangeToken();
          if (!exchange_token) throw new Error('No exchange token');

          const options = await firstValueFrom(authService.setupPasskey({ exchange_token }));
          
          let attResp;
          try {
            attResp = await startRegistration({ optionsJSON: options });
          } catch (error: any) {
            patchState(store, { isLoading: false });
            return;
          }

          await firstValueFrom(authService.registerPasskey({
            exchange_token,
            clientDataJSON: (attResp.response as any).clientDataJSON,
            attestationObject: (attResp.response as any).attestationObject
          }));

          // Finalizar
          await firstValueFrom(authService.completeInvitation({ exchange_token, codes_safeguarded: true }));
          patchState(store, { isLoading: false, activationPhase: 4 });
        } catch (err: any) {
          const fallback = err?.error?.message || 'Error al registrar Passkey o completar la cuenta';
          alert(fallback);
          patchState(store, { isLoading: false });
        }
      },

      async skipPasskey() {
        patchState(store, { isLoading: true, error: null });
        try {
          const exchange_token = store.activationExchangeToken();
          if (!exchange_token) throw new Error('No exchange token');

          await firstValueFrom(authService.completeInvitation({ exchange_token, codes_safeguarded: true }));
          patchState(store, { isLoading: false, activationPhase: 4 });
        } catch (err: any) {
          const fallback = err?.error?.message || 'Error al completar activación';
          alert(fallback);
          patchState(store, { isLoading: false });
        }
      },

      async resendInvitation(token: string) {
        patchState(store, { isLoading: true, error: null });
        try {
          const res = await firstValueFrom(authService.resendInvitation({ token }));
          patchState(store, { isLoading: false });
          alert(res.message || "¡Nueva invitación enviada a tu correo!");
        } catch (err: any) {
          const fallback = err?.error?.message || 'Error al reenviar invitación';
          patchState(store, { isLoading: false, error: fallback });
        }
      },
      
      resetState() {
        patchState(store, initialAuthState);
      }
    };
  })
);
