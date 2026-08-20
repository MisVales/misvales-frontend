import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_CONFIG } from '../api/api.config';
import { AuthTokenStore } from './auth-token.store';
import { SessionRefreshService } from './session-refresh.service';

describe('SessionRefreshService', () => {
  let service: SessionRefreshService;
  let http: HttpTestingController;
  let tokenStore: Pick<AuthTokenStore, 'set' | 'accessToken'>;

  beforeEach(() => {
    let accessToken: string | null = null;
    tokenStore = {
      set: (token: string) => { accessToken = token; },
      accessToken: () => accessToken,
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withXsrfConfiguration({
            cookieName: 'XSRF-TOKEN',
            headerName: 'X-XSRF-TOKEN',
          }),
        ),
        provideHttpClientTesting(),
        SessionRefreshService,
        { provide: AuthTokenStore, useValue: tokenStore },
        { provide: API_CONFIG, useValue: { baseUrl: 'https://api.example.test/api/v1' } },
      ],
    });

    service = TestBed.inject(SessionRefreshService);
    http = TestBed.inject(HttpTestingController);
    document.cookie = 'XSRF-TOKEN=csrf-test-token; path=/';
  });

  afterEach(() => {
    http.verify();
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('obtiene CSRF antes de renovar y conserva la sesión con API absoluta', async () => {
    const refresh = firstValueFrom(service.refresh());

    const csrf = http.expectOne('https://api.example.test/sanctum/csrf-cookie');
    expect(csrf.request.method).toBe('GET');
    expect(csrf.request.withCredentials).toBe(true);
    csrf.flush({});

    const request = http.expectOne('https://api.example.test/api/v1/auth/refresh');
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-test-token');
    expect(request.request.headers.has('X-Request-Id')).toBe(true);
    request.flush({ access_token: 'renewed-access-token', expires_in: 3600 });

    await refresh;
    expect(tokenStore.accessToken()).toBe('renewed-access-token');
  });
});
