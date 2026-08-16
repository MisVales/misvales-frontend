import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_CONFIG, defaultApiConfig } from '@core/api/api.config';
import { AuthTokenStore } from '@core/session/auth-token.store';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let tokenStore: AuthTokenStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: API_CONFIG, useValue: defaultApiConfig },
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    tokenStore = TestBed.inject(AuthTokenStore);
  });

  afterEach(() => http.verify());

  it('solicita la cookie CSRF sin exponer secretos', () => {
    service.getCsrfCookie().subscribe();
    const request = http.expectOne('/sanctum/csrf-cookie');
    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('inicia sesión y conserva los tokens solo en memoria', async () => {
    const result = firstValueFrom(service.login({ email: 'test@example.com', password: 'secret' }));
    const request = http.expectOne('/api/v1/auth/login');
    request.flush({ access_token: 'access', expires_in: 3600 });

    await result;
    expect(tokenStore.accessToken()).toBe('access');
  });

  it('envía el TOTP al endpoint contractual', () => {
    const payload = { mfa_challenge_token: 'challenge', totp_code: '123456' };
    service.verifyMfa(payload).subscribe();
    const request = http.expectOne('/api/v1/auth/mfa/totp/verify');
    expect(request.request.body).toEqual(payload);
    request.flush({ access_token: 'access', expires_in: 3600 });
  });

  it('inspecciona una invitación mediante POST sin incluir el token en la URL', () => {
    service.inspectInvitation({ token: 'invitation-token' }).subscribe();
    const request = http.expectOne('/api/v1/auth/invitations/inspect');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ token: 'invitation-token' });
    request.flush({ exchange_token: 'exchange', user: { name: 'User', email: 'u@example.com' } });
  });
});
