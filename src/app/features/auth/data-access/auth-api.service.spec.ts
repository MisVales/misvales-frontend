import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { apiUrlInterceptor } from '@core/interceptors/api-url.interceptor';
import { credentialsInterceptor } from '@core/interceptors/credentials.interceptor';

import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  let api: AuthApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor, credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(AuthApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it.each(['administrativa', 'tableta', 'distribuidora'] as const)(
    'sends the exact login payload for %s',
    async (application) => {
      const promise = firstValueFrom(
        api.login({ email: 'usuario@example.test', password: 'secreto', application }),
      );
      const request = http.expectOne('/api/v1/auth/login');
      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({
        email: 'usuario@example.test',
        password: 'secreto',
        application,
      });
      expect(request.request.withCredentials).toBe(true);
      expect(request.request.headers.has('Idempotency-Key')).toBe(false);
      request.flush({
        message: 'MFA requerido',
        data: {
          mfa_token: 'temporal',
          expires_at: '2026-07-30T12:05:00-06:00',
          allowed_factors: ['TOTP'],
          webauthn_challenge: null,
        },
      });
      await promise;
    },
  );

  it('keeps exact names for TOTP and recovery-code verification', async () => {
    const totp = firstValueFrom(api.verifyTotp('mfa-token', '123456'));
    const totpRequest = http.expectOne('/api/v1/auth/mfa/totp/verify');
    expect(totpRequest.request.body).toEqual({ mfa_token: 'mfa-token', code: '123456' });
    totpRequest.flush({ data: {} });
    await totp;

    const recovery = firstValueFrom(api.verifyRecoveryCode('mfa-token', 'safe-code'));
    const recoveryRequest = http.expectOne('/api/v1/auth/mfa/recovery-code/verify');
    expect(recoveryRequest.request.body).toEqual({
      mfa_token: 'mfa-token',
      code: 'safe-code',
    });
    recoveryRequest.flush({ data: {} });
    await recovery;
  });

  it('covers invitation, recovery, passkey and logout contracts', async () => {
    const passkey = firstValueFrom(
      api.verifyPasskey('mfa-token', {
        id: 'credential',
        rawId: 'credential',
        type: 'public-key',
        response: {
          clientDataJSON: 'client',
          authenticatorData: 'authenticator',
          signature: 'signature',
          userHandle: null,
        },
      }),
    );
    http.expectOne('/api/v1/auth/mfa/webauthn/verify').flush({ data: {} });
    await passkey;

    const inspect = firstValueFrom(api.inspectInvitation('original-token'));
    http.expectOne('/api/v1/auth/invitations/inspect').flush({
      data: {
        exchange_token: 'exchange',
        expires_at: '2026-07-30T12:05:00-06:00',
        purpose: 'ACCOUNT_ACTIVATION',
        confirmation_pending: false,
        account: { id: 'id', email: 'user@example.test', name: 'User' },
      },
    });
    await inspect;

    const completeInvitation = firstValueFrom(
      api.completeInvitation({
        exchange_token: 'exchange',
        password: 'secret',
        password_confirmation: 'secret',
        mfa: { type: 'TOTP', secret: 'totp-secret', code: '123456' },
      }),
    );
    http
      .expectOne('/api/v1/auth/invitations/complete')
      .flush({ data: { confirmation_required: true, login_required: false } });
    await completeInvitation;

    const requestRecovery = firstValueFrom(api.requestRecovery('user@example.test'));
    http.expectOne('/api/v1/auth/recovery/password').flush({});
    await requestRecovery;

    const completeRecovery = firstValueFrom(
      api.completeRecovery({
        token: 'recovery',
        password: 'new',
        password_confirmation: 'new',
        factor_type: 'RECOVERY_CODE',
        factor_value: 'safe-code',
      }),
    );
    http.expectOne('/api/v1/auth/recovery/password/complete').flush({});
    await completeRecovery;

    const logout = firstValueFrom(api.logout());
    http.expectOne('/api/v1/auth/logout').flush({ message: 'Sesión cerrada.' });
    await logout;
  });
});
