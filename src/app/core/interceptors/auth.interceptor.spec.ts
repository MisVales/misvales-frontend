import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { API_CONFIG, defaultApiConfig } from '../api/api.config';
import { vi } from 'vitest';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: defaultApiConfig }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should add X-Request-Id header', () => {
    http.get('/test').subscribe();

    const req = httpTestingController.expectOne('/test');
    expect(req.request.headers.has('X-Request-Id')).toBe(true);
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('should add Authorization header if token exists in localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-token');

    http.get('/test').subscribe();

    const req = httpTestingController.expectOne('/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush({});
  });
});
