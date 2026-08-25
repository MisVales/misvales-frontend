import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG } from '../api/api.config';
import { RealtimeSocketStore } from '../realtime/realtime-socket.store';
import { AuthTokenStore } from '../session/auth-token.store';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let tokenStore: AuthTokenStore;
  let socketStore: RealtimeSocketStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: '/api/v1' } },
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    tokenStore = TestBed.inject(AuthTokenStore);
    socketStore = TestBed.inject(RealtimeSocketStore);
  });

  afterEach(() => controller.verify());

  it('uses the current in-memory token for every request, including after refresh', () => {
    tokenStore.set('first-token', 3600);
    http.get('/api/v1/me').subscribe();
    const first = controller.expectOne('/api/v1/me');
    expect(first.request.headers.get('Authorization')).toBe('Bearer first-token');
    first.flush({});

    tokenStore.set('refreshed-token', 3600);
    http.get('/api/v1/me').subscribe();
    const refreshed = controller.expectOne('/api/v1/me');
    expect(refreshed.request.headers.get('Authorization')).toBe('Bearer refreshed-token');
    refreshed.flush({});
  });

  it('adds the active X-Socket-ID only to requests for our API', () => {
    socketStore.set('123.456');

    http.post('/api/broadcasting/auth', {}).subscribe();
    const api = controller.expectOne('/api/broadcasting/auth');
    expect(api.request.headers.get('X-Socket-ID')).toBe('123.456');
    expect(api.request.headers.has('X-Request-Id')).toBe(true);
    expect(api.request.headers.has('X-Correlation-Id')).toBe(true);
    expect(api.request.withCredentials).toBe(true);
    api.flush({});

    http.get('https://third-party.example.test/resource').subscribe();
    const external = controller.expectOne('https://third-party.example.test/resource');
    expect(external.request.headers.has('X-Socket-ID')).toBe(false);
    external.flush({});
  });

  it('omits X-Socket-ID while the connection is inactive', () => {
    http.get('/api/v1/me').subscribe();

    const request = controller.expectOne('/api/v1/me');
    expect(request.request.headers.has('X-Socket-ID')).toBe(false);
    request.flush({});
  });
});
