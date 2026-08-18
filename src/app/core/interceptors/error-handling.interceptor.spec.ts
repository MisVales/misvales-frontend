import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorHandlingInterceptor, isConcurrencyConflict, sanitizeServerError } from './error-handling.interceptor';
import { SessionStore } from '../session/session.store';
import { AlertService } from '../../shared/services/alert.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthTokenStore } from '../session/auth-token.store';
import { SessionExpiredService } from '../session/session-expired.service';
import { SessionRefreshService } from '../session/session-refresh.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('errorHandlingInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let sessionStoreSpy: any;
  let alertServiceSpy: any;
  let tokenStoreSpy: any;
  let sessionRefreshSpy: any;
  let sessionExpired: SessionExpiredService;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sessionStoreSpy = { clearSession: vi.fn() };
    alertServiceSpy = { showAlert: vi.fn() };
    tokenStoreSpy = { accessToken: vi.fn(() => null), clear: vi.fn() };
    sessionRefreshSpy = { refresh: vi.fn(() => throwError(() => new Error('expired'))) };
    routerSpy = { navigate: vi.fn(() => Promise.resolve(true)) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorHandlingInterceptor])),
        provideHttpClientTesting(),
        { provide: SessionStore, useValue: sessionStoreSpy },
        { provide: AlertService, useValue: alertServiceSpy },
        { provide: AuthTokenStore, useValue: tokenStoreSpy },
        { provide: SessionRefreshService, useValue: sessionRefreshSpy },
        { provide: Router, useValue: routerSpy },
      ]
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    sessionExpired = TestBed.inject(SessionExpiredService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('clears the session and redirects to login when refresh fails after a 401', () => {
    http.get('/test').subscribe({
      error: (error) => expect(error).toBeTruthy()
    });

    const req = httpTestingController.expectOne('/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(sessionStoreSpy.clearSession).toHaveBeenCalled();
    expect(tokenStoreSpy.clear).toHaveBeenCalled();
    expect(sessionExpired.isOpen()).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], { replaceUrl: true });
  });

  it('keeps the session active on a 403 error', () => {
    http.get('/test').subscribe({
      error: (error) => expect(error).toBeTruthy()
    });

    const req = httpTestingController.expectOne('/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(sessionStoreSpy.clearSession).not.toHaveBeenCalled();
    expect(tokenStoreSpy.clear).not.toHaveBeenCalled();
    expect(sessionExpired.isOpen()).toBe(false);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(alertServiceSpy.showAlert).toHaveBeenCalledWith(
      'No tienes autorización para realizar esta acción. Tu sesión sigue activa.',
      'error',
      7000,
    );
  });

  it('clears the session and redirects to login on a 419 response', () => {
    http.get('/test').subscribe({
      error: (error) => expect(error).toBeTruthy()
    });

    const req = httpTestingController.expectOne('/test');
    req.flush('Page Expired', { status: 419, statusText: 'Page Expired' });

    expect(sessionStoreSpy.clearSession).toHaveBeenCalled();
    expect(sessionExpired.isOpen()).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], { replaceUrl: true });
  });

  it('does not present an expired authenticated session when the CSRF preflight fails', () => {
    http.get('/sanctum/csrf-cookie').subscribe({
      error: (error) => expect(error.status).toBe(419),
    });

    httpTestingController
      .expectOne('/sanctum/csrf-cookie')
      .flush('Page Expired', { status: 419, statusText: 'Page Expired' });

    expect(sessionStoreSpy.clearSession).not.toHaveBeenCalled();
    expect(sessionExpired.isOpen()).toBe(false);
  });

  it('retries a safe read once with the refreshed access token', () => {
    sessionRefreshSpy.refresh.mockReturnValue(of(undefined));
    tokenStoreSpy.accessToken.mockReturnValue('refreshed-access-token');
    let response: unknown;
    http.get('/test').subscribe((value) => {
      response = value;
    });

    httpTestingController
      .expectOne('/test')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    const retry = httpTestingController.expectOne(
      (request) => request.url === '/test' && request.headers.get('X-Session-Retry') === '1',
    );

    expect(retry.request.headers.get('Authorization')).toBe('Bearer refreshed-access-token');
    retry.flush({ ok: true });

    expect(response).toEqual({ ok: true });
    expect(sessionStoreSpy.clearSession).not.toHaveBeenCalled();
    expect(sessionExpired.isOpen()).toBe(false);
  });

  it('keeps the refreshed session when the retried request is forbidden', () => {
    sessionRefreshSpy.refresh.mockReturnValue(of(undefined));
    tokenStoreSpy.accessToken.mockReturnValue('refreshed-access-token');
    http.get('/test').subscribe({ error: (error) => expect(error.status).toBe(403) });

    httpTestingController
      .expectOne('/test')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    httpTestingController
      .expectOne((request) => request.headers.get('X-Session-Retry') === '1')
      .flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(sessionStoreSpy.clearSession).not.toHaveBeenCalled();
    expect(tokenStoreSpy.clear).not.toHaveBeenCalled();
    expect(sessionExpired.isOpen()).toBe(false);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('converges simultaneous expired reads on login redirection', () => {
    http.get('/first').subscribe({ error: () => undefined });
    http.get('/second').subscribe({ error: () => undefined });

    httpTestingController
      .expectOne('/first')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    httpTestingController
      .expectOne('/second')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(sessionRefreshSpy.refresh).toHaveBeenCalledTimes(2);
    expect(sessionExpired.isOpen()).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], { replaceUrl: true });
  });

  it('does not report a business-rule 409 as stale information', () => {
    http.post('/test', {}).subscribe({ error: (error) => expect(error).toBeTruthy() });

    const req = httpTestingController.expectOne('/test');
    req.flush(
      { error: { code: 'CREDIT_50_PERCENT_RULE_NOT_SATISFIED', message: 'Fuera del rango permitido.' } },
      { status: 409, statusText: 'Conflict' },
    );

    expect(alertServiceSpy.showAlert).not.toHaveBeenCalled();
  });

  it('reports a version conflict as stale information', () => {
    http.patch('/test', {}).subscribe({ error: (error) => expect(error).toBeTruthy() });

    const req = httpTestingController.expectOne('/test');
    req.flush(
      { error: { code: 'RESOURCE_VERSION_CONFLICT', message: 'Conflicto de concurrencia.' } },
      { status: 409, statusText: 'Conflict' },
    );

    expect(alertServiceSpy.showAlert).toHaveBeenCalledWith(
      'La información cambió mientras trabajaba. Recargue los datos e inténtelo de nuevo.',
      'error',
      7000,
    );
  });

  it('reports a 412 precondition failure as stale information', () => {
    http.patch('/test', {}).subscribe({ error: (error) => expect(error.status).toBe(412) });

    httpTestingController
      .expectOne('/test')
      .flush(
        { error: { code: 'PRECONDITION_FAILED' } },
        { status: 412, statusText: 'Precondition Failed' },
      );

    expect(alertServiceSpy.showAlert).toHaveBeenCalledWith(
      'La información cambió mientras trabajaba. Recargue los datos e inténtelo de nuevo.',
      'error',
      7000,
    );
  });

  it('distinguishes a temporary 503 from an internal server failure', () => {
    http.get('/test').subscribe({ error: (error) => expect(error.status).toBe(503) });

    httpTestingController
      .expectOne('/test')
      .flush({}, { status: 503, statusText: 'Service Unavailable' });

    expect(alertServiceSpy.showAlert).toHaveBeenCalledWith(
      'El servicio no está disponible temporalmente. Intenta nuevamente.',
      'error',
      7000,
    );
  });

  it('shows a safe request reference for an internal server failure', () => {
    http.get('/test').subscribe({ error: (error) => expect(error.status).toBe(500) });

    httpTestingController
      .expectOne('/test')
      .flush(
        { error: { request_id: 'request-500' } },
        { status: 500, statusText: 'Internal Server Error' },
      );

    expect(alertServiceSpy.showAlert).toHaveBeenCalledWith(
      'No se pudo completar la operación. Tus datos capturados no se han eliminado. Referencia: request-500.',
      'error',
      7000,
    );
  });
});

describe('isConcurrencyConflict', () => {
  it('recognizes both nested and top-level version conflict codes', () => {
    expect(isConcurrencyConflict(new HttpErrorResponse({ status: 409, error: { error: { code: 'CREDIT_LINE_VERSION_CONFLICT' } } }))).toBe(true);
    expect(isConcurrencyConflict(new HttpErrorResponse({ status: 409, error: { code: 'VERSION_CONFLICT' } }))).toBe(true);
  });

  it('recognizes HTTP 412 as a concurrency conflict', () => {
    expect(isConcurrencyConflict(new HttpErrorResponse({ status: 412 }))).toBe(true);
  });

  it('rejects non-concurrency business conflicts', () => {
    expect(isConcurrencyConflict(new HttpErrorResponse({ status: 409, error: { error: { code: 'CREDIT_INSUFFICIENT' } } }))).toBe(false);
  });
});

describe('sanitizeServerError', () => {
  const sqlMessage = 'SQLSTATE[42703]: Undefined column: valid_to does not exist';

  it('keeps technical server details in development', () => {
    const error = new HttpErrorResponse({ error: { message: sqlMessage }, status: 500 });

    expect(sanitizeServerError(error, true).error.message).toBe(sqlMessage);
  });

  it('hides technical server details in production', () => {
    const error = new HttpErrorResponse({
      error: { message: sqlMessage, request_id: 'request-500' },
      status: 500,
    });
    const sanitized = sanitizeServerError(error, false);

    expect(sanitized.error.message).toBe('Ocurrió un error interno. Intenta nuevamente más tarde.');
    expect(sanitized.error.request_id).toBe('request-500');
    expect(JSON.stringify(sanitized.error)).not.toContain('SQLSTATE');
  });
});
