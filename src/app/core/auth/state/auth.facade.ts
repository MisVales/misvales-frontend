import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withMethods, withState, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { AuthService } from '../data-access/auth.service';
import {
  LoginReq,
  LoginRes,
  MfaMethod,
  MfaReq,
  RecoverReq,
  ResetPwdReq,
  SetupInvitationReq,
} from '../data-access/auth.dtos';
import { SessionStore } from '@core/session/session.store';
import { AuthTokenStore } from '@core/session/auth-token.store';
import { MeService } from '@core/auth/data-access/me.service';
import { AlertService } from '../../../shared/components/alerts/alert.service';
import { AuthConfigurationService } from '../data-access/auth-configuration.service';
import {
  apiErrorCode,
  apiErrorMessage,
  apiValidationErrors,
  ValidationErrorsByField,
} from '@core/api/api-error';

export interface AuthState {
  isLoading: boolean;
  error: string | null;
  validationErrors: ValidationErrorsByField;
  mfaChallengeToken: string | null;
  availableMfa: MfaMethod[];
  mfaStep: 'totp' | 'passkey';
  mfaExpiresAt: number | null;
  activationPhase: number;
  activationOriginalToken: string | null;
  activationExchangeToken: string | null;
  activationUser: { name: string; email: string; roles?: string[] } | null;
  activationQrCode: string | null;
  activationTotpSecret: string | null;
  activationMfaBypass: boolean;
  activationRecoveryCodes: string[] | null;
}

const initialAuthState: AuthState = {
  isLoading: false,
  error: null,
  validationErrors: {},
  mfaChallengeToken: null,
  availableMfa: [],
  mfaStep: 'totp',
  mfaExpiresAt: null,
  activationPhase: 0,
  activationOriginalToken: null,
  activationExchangeToken: null,
  activationUser: null,
  activationQrCode: null,
  activationTotpSecret: null,
  activationMfaBypass: false,
  activationRecoveryCodes: null,
};

const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  INVALID_CREDENTIALS: 'El correo o contraseña son incorrectos.',
  ACCOUNT_INACTIVE: 'La cuenta no está disponible para iniciar sesión.',
  RATE_LIMIT_EXCEEDED: 'Se alcanzó el límite de intentos. Espera antes de volver a intentarlo.',
  INVALID_MFA: 'El código de autenticación es incorrecto.',
  EXPIRED_MFA_CHALLENGE: 'La verificación expiró. Inicia sesión nuevamente.',
  RECOVERY_CODE_USED: 'El código de recuperación es incorrecto o ya fue utilizado.',
  INVALID_INVITATION: 'La invitación no es válida.',
  USED_INVITATION: 'La invitación ya fue utilizada o revocada.',
  EXPIRED_INVITATION: 'La invitación ha expirado.',
  TURNSTILE_REQUIRED: 'La verificación de seguridad es obligatoria.',
  INVALID_TURNSTILE: 'La verificación de seguridad no pudo validarse. Intente nuevamente.',
  CONFIG_ERROR: 'Error de configuración en el servicio de seguridad.',
};

function messageFor(error: unknown, fallback: string): string {
  const code = apiErrorCode(error, 'UNEXPECTED_ERROR');
  const backendMsg = apiErrorMessage(error, '');
  if (code === 'RATE_LIMIT_EXCEEDED' && backendMsg && backendMsg !== 'Too Many Attempts.') {
    return backendMsg;
  }
  return ERROR_MESSAGES[code] ?? (backendMsg || fallback);
}

export const AuthFacade = signalStore(
  { providedIn: 'root' },
  withState(initialAuthState),
  withMethods((store) => {
    const authService = inject(AuthService);
    const sessionStore = inject(SessionStore);
    const tokenStore = inject(AuthTokenStore);
    const meService = inject(MeService);
    const router = inject(Router);
    const alerts = inject(AlertService);
    const diagnostics = inject(AuthConfigurationService);

    async function establishSession(): Promise<void> {
      await firstValueFrom(meService.fetchMe());
      patchState(store, {
        isLoading: false,
        error: null,
        mfaChallengeToken: null,
        availableMfa: [],
        mfaExpiresAt: null,
      });
      await router.navigate(['/inicio']);
    }

    function fail(error: unknown, fallback: string): void {
      patchState(store, {
        isLoading: false,
        error: messageFor(error, fallback),
        validationErrors: apiValidationErrors(error),
      });
    }

    async function completeInvitation(): Promise<void> {
      const exchangeToken = store.activationExchangeToken();
      if (!exchangeToken) return;
      patchState(store, { isLoading: true, error: null });
      try {
        await firstValueFrom(
          authService.completeInvitation({
            exchange_token: exchangeToken,
            codes_safeguarded: true,
          }),
        );
        patchState(store, {
          isLoading: false,
          activationPhase: 4,
          activationExchangeToken: null,
          activationOriginalToken: null,
          activationTotpSecret: null,
          activationQrCode: null,
          activationRecoveryCodes: null,
        });
      } catch (error: unknown) {
        fail(error, 'Error al completar la activación.');
      }
    }

    return {
      async login(credentials: LoginReq): Promise<void> {
        tokenStore.clear();
        sessionStore.clearSession();
        patchState(store, { isLoading: true, error: null, validationErrors: {} });
        try {
          const response = await firstValueFrom(authService.login(credentials));
          if (response.mfa_challenge_token) {
            patchState(store, {
              isLoading: false,
              mfaChallengeToken: response.mfa_challenge_token,
              availableMfa: response.available_mfa ?? [],
              mfaStep: 'totp',
              mfaExpiresAt: response.expires_in ? Date.now() + response.expires_in * 1000 : null,
            });
            await router.navigate(['/auth/totp']);
            return;
          }
          if (response.access_token) await establishSession();
        } catch (error: unknown) {
          fail(error, 'Error al iniciar sesión.');
        }
      },

      async verifyMfa(data: Omit<MfaReq, 'mfa_challenge_token'>): Promise<void> {
        const token = store.mfaChallengeToken();
        if (!token) {
          patchState(store, { error: ERROR_MESSAGES['EXPIRED_MFA_CHALLENGE'] });
          await router.navigate(['/auth/login']);
          return;
        }

        patchState(store, { isLoading: true, error: null, validationErrors: {} });
        try {
          const response = await firstValueFrom(
            authService.verifyMfa({ ...data, mfa_challenge_token: token }),
          );
          if (response.next_step === 'PASSKEY') {
            patchState(store, {
              isLoading: false,
              mfaStep: 'passkey',
              mfaChallengeToken: response.mfa_challenge_token ?? token,
              mfaExpiresAt: response.expires_in
                ? Date.now() + response.expires_in * 1000
                : store.mfaExpiresAt(),
            });
            return;
          }
          if (response.access_token) await establishSession();
        } catch (error: unknown) {
          if (apiErrorCode(error, '') === 'EXPIRED_MFA_CHALLENGE') {
            patchState(store, initialAuthState);
            await router.navigate(['/auth/login']);
            return;
          }
          fail(error, 'Código MFA inválido.');
        }
      },

      async verifyPasskeyMfa(): Promise<void> {
        const token = store.mfaChallengeToken();
        if (!token) {
          await router.navigate(['/auth/login']);
          return;
        }

        patchState(store, { isLoading: true, error: null });
        let response: LoginRes;
        try {
          const optionsJSON = await firstValueFrom(
            authService.getPasskeyOptions({ mfa_challenge_token: token }),
          );
          const credential = await startAuthentication({ optionsJSON });
          response = await firstValueFrom(
            authService.verifyPasskey({
              mfa_challenge_token: token,
              id: credential.id,
              clientDataJSON: credential.response.clientDataJSON,
              authenticatorData: credential.response.authenticatorData,
              signature: credential.response.signature,
            }),
          );
        } catch (error: unknown) {
          fail(error, 'La verificación con Passkey fue cancelada o no está disponible.');
          return;
        }

        if (!response.access_token) {
          patchState(store, {
            isLoading: false,
            error: 'El servidor confirmó la Passkey, pero no entregó una sesión de acceso.',
          });
          return;
        }

        tokenStore.set(response.access_token, response.expires_in ?? 300);

        try {
          await establishSession();
        } catch {
          if (!response.user) {
            patchState(store, {
              isLoading: false,
              error: 'La Passkey fue verificada, pero no fue posible cargar la sesión.',
            });
            return;
          }

          sessionStore.setSession({ ...response.user, id: String(response.user.id) }, [], [], null);
          patchState(store, {
            isLoading: false,
            error: null,
            mfaChallengeToken: null,
            availableMfa: [],
            mfaExpiresAt: null,
          });
          alerts.showAlert(
            'Inicio de sesión completado. Algunos permisos se actualizarán al recargar.',
            'success',
          );
          await router.navigate(['/inicio']);
        }
      },

      async recoverAccess(data: RecoverReq): Promise<boolean> {
        patchState(store, { isLoading: true, error: null, validationErrors: {} });
        try {
          await firstValueFrom(authService.recoverAccess(data));
          patchState(store, { isLoading: false });
          return true;
        } catch (error: unknown) {
          fail(error, 'Error al solicitar la recuperación de acceso.');
          return false;
        }
      },

      async resetPassword(data: ResetPwdReq): Promise<boolean> {
        patchState(store, { isLoading: true, error: null, validationErrors: {} });
        try {
          await firstValueFrom(authService.resetPassword(data));
          patchState(store, { isLoading: false });
          return true;
        } catch (error: unknown) {
          fail(error, 'Error al restablecer la contraseña.');
          return false;
        }
      },

      async logout(): Promise<void> {
        try {
          await firstValueFrom(authService.logout());
        } catch {
          alerts.showAlert(
            'La sesión local se cerró, pero no fue posible confirmar la revocación en el servidor.',
            'error',
            7000,
          );
        } finally {
          tokenStore.clear();
          sessionStore.clearSession();
          patchState(store, initialAuthState);
          await router.navigate(['/auth/login']);
        }
      },

      async inspectInvitation(token: string): Promise<void> {
        if (store.isLoading() || store.activationPhase() > 0) return;
        patchState(store, {
          isLoading: true,
          error: null,
          validationErrors: {},
          activationPhase: 0,
          activationOriginalToken: token,
          activationMfaBypass: false,
        });
        try {
          diagnostics.log('INVITATION_INSPECTION_STARTED', { tokenPresent: Boolean(token) });
          const response = await firstValueFrom(authService.inspectInvitation({ token }));
          patchState(store, {
            isLoading: false,
            activationPhase: response.step === 'passkey' ? 3 : 1,
            activationExchangeToken: response.exchange_token,
            activationUser: response.user,
            activationQrCode: response.totp_setup?.qr_code_url ?? null,
            activationTotpSecret:
              response.totp_setup?.secret ?? response.totp_setup?.secret_key ?? null,
            activationMfaBypass: Boolean(response.development_mfa_bypass),
          });
          diagnostics.log('INVITATION_INSPECTION_COMPLETED', { step: response.step ?? 'setup' });
        } catch (error: unknown) {
          diagnostics.log('INVITATION_INSPECTION_FAILED', {
            code: apiErrorCode(error, 'UNEXPECTED_ERROR'),
            message: apiErrorMessage(error, 'No fue posible validar la invitación.'),
          });
          fail(error, 'La invitación no es válida o ha expirado.');
        }
      },

      async setupInvitation(data: Omit<SetupInvitationReq, 'exchange_token'>): Promise<void> {
        const exchangeToken = store.activationExchangeToken();
        if (!exchangeToken) {
          patchState(store, { error: 'La sesión de activación expiró.' });
          return;
        }

        patchState(store, { isLoading: true, error: null, validationErrors: {} });
        try {
          const response = await firstValueFrom(
            authService.setupInvitation({ ...data, exchange_token: exchangeToken }),
          );
          patchState(store, {
            isLoading: false,
            activationPhase: response.development_mfa_bypass ? 3 : 2,
            activationRecoveryCodes: response.development_mfa_bypass
              ? null
              : response.recovery_codes,
          });
        } catch (error: unknown) {
          fail(error, 'Error al configurar la cuenta.');
        }
      },

      proceedToPasskeys(): void {
        if (store.activationRecoveryCodes()?.length) {
          patchState(store, { activationPhase: 3, activationRecoveryCodes: null });
        }
      },

      completeInvitation,

      async registerPasskey(): Promise<void> {
        const exchangeToken = store.activationExchangeToken();
        if (!exchangeToken) return;
        patchState(store, { isLoading: true, error: null });
        try {
          const optionsJSON = await firstValueFrom(
            authService.setupPasskey({ exchange_token: exchangeToken }),
          );
          const credential = await startRegistration({ optionsJSON });
          await firstValueFrom(
            authService.registerPasskey({
              exchange_token: exchangeToken,
              clientDataJSON: credential.response.clientDataJSON,
              attestationObject: credential.response.attestationObject,
            }),
          );
          await completeInvitation();
        } catch (error: unknown) {
          fail(error, 'El registro de Passkey fue cancelado o no pudo completarse.');
        }
      },

      async skipPasskey(): Promise<void> {
        await completeInvitation();
      },

      async resendInvitation(): Promise<void> {
        const token = store.activationOriginalToken();
        if (!token) return;
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(authService.resendInvitation({ token }));
          patchState(store, { isLoading: false });
          alerts.showAlert(response.message, 'success', 5000);
        } catch (error: unknown) {
          fail(error, 'Error al reenviar la invitación.');
        }
      },

      resetState(): void {
        patchState(store, initialAuthState);
      },
    };
  }),
);
