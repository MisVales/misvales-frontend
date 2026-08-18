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

describe('errorHandlingInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let sessionStoreSpy: any;
  let alertServiceSpy: any;
  let tokenStoreSpy: any;
  let sessionRefreshSpy: any;
  let sessionExpired: SessionExpiredService;

  beforeEach(() => {
    sessionStoreSpy = { clearSession: vi.fn() };
    alertServiceSpy = { showAlert: vi.fn() };
    tokenStoreSpy = { accessToken: vi.fn(() => null), clear: vi.fn() };
    sessionRefreshSpy = { refresh: vi.fn(() => throwError(() => new Error('expired'))) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorHandlingInterceptor])),
        provideHttpClientTesting(),
        { provide: SessionStore, useValue: sessionStoreSpy },
        { provide: AlertService, useValue: alertServiceSpy },
        { provide: AuthTokenStore, useValue: tokenStoreSpy },
        { provide: SessionRefreshService, useValue: sessionRefreshSpy }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    sessionExpired = TestBed.inject(SessionExpiredService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('opens the blocking session state when refresh fails after a 401', () => {
    http.get('/test').subscribe({
      error: (error) => expect(error).toBeTruthy()
    });

    const req = httpTestingController.expectOne('/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(sessionStoreSpy.clearSession).toHaveBeenCalled();
    expect(tokenStoreSpy.clear).toHaveBeenCalled();
    expect(sessionExpired.isOpen()).toBe(true);
  });

  it('should preserve the session and report denied access on 403 error', () => {
    http.get('/test').subscribe({
      error: (error) => expect(error).toBeTruthy()
    });

    const req = httpTestingController.expectOne('/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(sessionStoreSpy.clearSession).not.toHaveBeenCalled();
    expect(sessionExpired.isOpen()).toBe(false);
    expect(alertServiceSpy.showAlert).toHaveBeenCalledWith(
      'No tiene permiso para realizar esta acción.',
      'error',
      6000
    );
  });

  it('opens the blocking session state on a 419 response', () => {
    http.get('/test').subscribe({
      error: (error) => expect(error).toBeTruthy()
    });

    const req = httpTestingController.expectOne('/test');
    req.flush('Page Expired', { status: 419, statusText: 'Page Expired' });

    expect(sessionStoreSpy.clearSession).toHaveBeenCalled();
    expect(sessionExpired.isOpen()).toBe(true);
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

  it('preserves the refreshed session when the retried request is forbidden', () => {
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
    expect(alertServiceSpy.showAlert).toHaveBeenCalledWith(
      'No tiene permiso para realizar esta acción.',
      'error',
      6000,
    );
  });

  it('converges simultaneous expired reads on one global session state', () => {
    http.get('/first').subscribe({ error: () => undefined });
    http.get('/second').subscribe({ error: () => undefined });

    httpTestingController
      .expectOne('/first')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    httpTestingController
      .expectOne('/second')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(sessionRefreshSpy.refresh).toHaveBeenCalledTimes(2);
    expect(sessionExpired.isOpen()).toBe(true);
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
});

describe('isConcurrencyConflict', () => {
  it('recognizes both nested and top-level version conflict codes', () => {
    expect(isConcurrencyConflict(new HttpErrorResponse({ status: 409, error: { error: { code: 'CREDIT_LINE_VERSION_CONFLICT' } } }))).toBe(true);
    expect(isConcurrencyConflict(new HttpErrorResponse({ status: 409, error: { code: 'VERSION_CONFLICT' } }))).toBe(true);
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
    const error = new HttpErrorResponse({ error: { message: sqlMessage }, status: 500 });
    const sanitized = sanitizeServerError(error, false);

    expect(sanitized.error.message).toBe('Ocurrió un error interno. Intenta nuevamente más tarde.');
    expect(JSON.stringify(sanitized.error)).not.toContain('SQLSTATE');
  });
});
