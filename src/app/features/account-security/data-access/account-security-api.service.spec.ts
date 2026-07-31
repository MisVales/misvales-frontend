import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { apiUrlInterceptor } from '@core/interceptors/api-url.interceptor';
import { credentialsInterceptor } from '@core/interceptors/credentials.interceptor';

import { AccountSecurityApiService } from './account-security-api.service';

describe('AccountSecurityApiService', () => {
  let api: AccountSecurityApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor, credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(AccountSecurityApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends the reauthentication binding and secrets only in the documented body', async () => {
    const payload = {
      method: 'PASSWORD_TOTP' as const,
      action: 'password.change' as const,
      resource_type: 'users',
      resource_id: '00000000-0000-4000-8000-000000000001',
      branch_id: null,
      parameters: {},
      reason: null,
      password: 'secreto',
      totp_code: '123456',
    };
    const promise = firstValueFrom(api.reauthenticate(payload));
    const request = http.expectOne('/api/v1/auth/reauthenticate');
    expect(request.request.body).toEqual(payload);
    expect(request.request.headers.has('X-Reauthentication-Token')).toBe(false);
    request.flush({
      data: { authorization_token: 'temporary', expires_at: '2026-07-30T12:05:00-06:00' },
    });
    await promise;
  });

  it('sends both required session revocation tokens and no idempotency header', async () => {
    const promise = firstValueFrom(api.revokeSession('session-id', 'reauth-token'));
    const request = http.expectOne('/api/v1/auth/sessions/session-id');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual({ reauth_token: 'reauth-token' });
    expect(request.request.headers.get('X-Reauthentication-Token')).toBe('reauth-token');
    expect(request.request.headers.has('Idempotency-Key')).toBe(false);
    request.flush({ message: 'Sesión revocada.' });
    await promise;
  });

  it('covers account-security commands without adding unrelated headers', async () => {
    const binding = {
      method: 'PASSKEY' as const,
      action: 'sessions.revoke_others' as const,
      resource_type: 'auth_sessions',
      resource_id: 'others',
      branch_id: null,
      parameters: {},
      reason: null,
    };
    const begin = firstValueFrom(api.beginPasskeyReauthentication(binding));
    http.expectOne('/api/v1/auth/reauthenticate').flush({
      data: {
        challenge_id: 'challenge-id',
        challenge: 'challenge',
        expires_at: '2026-07-30T12:05:00-06:00',
        allow_credentials: [],
      },
    });
    await begin;

    const finish = firstValueFrom(
      api.finishPasskeyReauthentication({
        ...binding,
        challenge_id: 'challenge-id',
        assertion: {
          id: 'credential',
          rawId: 'credential',
          type: 'public-key',
          response: {
            clientDataJSON: 'client',
            authenticatorData: 'authenticator',
            signature: 'signature',
            userHandle: null,
          },
        },
      }),
    );
    http.expectOne('/api/v1/auth/reauthenticate').flush({
      data: { authorization_token: 'authorization', expires_at: '2026-07-30T12:05:00-06:00' },
    });
    await finish;

    const password = firstValueFrom(api.changePassword('new', 'new', 'authorization'));
    http.expectOne('/api/v1/auth/password/change').flush({ message: 'Cambiada.' });
    await password;

    const setup = firstValueFrom(api.setupTotp());
    http
      .expectOne('/api/v1/auth/mfa/totp/setup')
      .flush({ data: { secret: 'secret', uri: 'otpauth://totp/test' } });
    await setup;

    const confirm = firstValueFrom(api.confirmTotp('secret', '123456', 'authorization'));
    http.expectOne('/api/v1/auth/mfa/totp/confirm').flush({ message: 'Confirmado.' });
    await confirm;

    const options = firstValueFrom(api.passkeyOptions());
    http.expectOne('/api/v1/auth/mfa/passkeys/options').flush({
      data: {
        challenge: 'challenge',
        rp: { name: 'MisVales' },
        user: { id: 'user', name: 'user@example.test', displayName: 'User' },
        pubKeyCredParams: [],
      },
    });
    await options;

    const register = firstValueFrom(api.registerPasskey('client', 'attestation', 'authorization'));
    http.expectOne('/api/v1/auth/mfa/passkeys').flush({ message: 'Registrada.' });
    await register;

    const regenerate = firstValueFrom(api.regenerateRecoveryCodes('authorization'));
    http
      .expectOne('/api/v1/auth/mfa/recovery-codes/regenerate')
      .flush({ data: { recovery_codes: ['code-1'] } });
    await regenerate;

    const sessions = firstValueFrom(api.sessions());
    http.expectOne('/api/v1/auth/sessions').flush({ data: [] });
    await sessions;

    const others = firstValueFrom(api.revokeOtherSessions('authorization'));
    http.expectOne('/api/v1/auth/sessions/others').flush({ message: 'Revocadas.' });
    await others;
  });

  it('normalizes both backend and published alert pagination and mutates exact routes', async () => {
    const nested = firstValueFrom(api.alerts());
    http.expectOne('/api/v1/security/alerts').flush({
      data: {
        data: [{ id: 'alert-1', title: 'Alerta' }],
        current_page: 1,
        per_page: 25,
        total: 1,
        prev_page_url: null,
        next_page_url: null,
      },
    });
    expect((await nested).data[0].id).toBe('alert-1');

    const published = firstValueFrom(api.alerts());
    http.expectOne('/api/v1/security/alerts').flush({
      data: [{ id: 'alert-2' }],
      links: { prev: null, next: null },
      meta: { current_page: 1, per_page: 25, total: 1 },
    });
    expect((await published).data[0].id).toBe('alert-2');

    const acknowledge = firstValueFrom(api.acknowledgeAlert('alert-1'));
    http
      .expectOne('/api/v1/security/alerts/alert-1/acknowledge')
      .flush({ data: { id: 'alert-1' } });
    await acknowledge;

    const request = firstValueFrom(api.requestAlertAction('alert-1'));
    const requestHttp = http.expectOne('/api/v1/security/alerts/alert-1/request-action');
    expect(requestHttp.request.body).toEqual({});
    requestHttp.flush({ data: { id: 'alert-1' } });
    await request;
  });
});
