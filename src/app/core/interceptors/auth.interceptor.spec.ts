import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthTokenStore } from '../session/auth-token.store';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let tokenStore: AuthTokenStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    tokenStore = TestBed.inject(AuthTokenStore);
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

});
