import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorHandlingInterceptor, isConcurrencyConflict, sanitizeServerError } from './error-handling.interceptor';
import { Router } from '@angular/router';
import { SessionStore } from '../session/session.store';
import { AlertService } from '../../shared/services/alert.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthTokenStore } from '../session/auth-token.store';
import { SessionRefreshService } from '../session/session-refresh.service';
import { throwError } from 'rxjs';

describe('errorHandlingInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let routerSpy: any;
  let sessionStoreSpy: any;
  let alertServiceSpy: any;
  let tokenStoreSpy: any;
  let sessionRefreshSpy: any;

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };
    sessionStoreSpy = { clearSession: vi.fn() };
    alertServiceSpy = { showAlert: vi.fn() };
    tokenStoreSpy = { accessToken: vi.fn(() => null), clear: vi.fn() };
    sessionRefreshSpy = { refresh: vi.fn(() => throwError(() => new Error('expired'))) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorHandlingInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: SessionStore, useValue: sessionStoreSpy },
        { provide: AlertService, useValue: alertServiceSpy },
        { provide: AuthTokenStore, useValue: tokenStoreSpy },
        { provide: SessionRefreshService, useValue: sessionRefreshSpy }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should redirect to login on 401 error', () => {
    http.get('/test').subscribe({
      error: (error) => expect(error).toBeTruthy()
    });

    const req = httpTestingController.expectOne('/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(sessionStoreSpy.clearSession).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should preserve the session and report denied access on 403 error', () => {
    http.get('/test').subscribe({
      error: (error) => expect(error).toBeTruthy()
    });

    const req = httpTestingController.expectOne('/test');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(sessionStoreSpy.clearSession).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(alertServiceSpy.showAlert).toHaveBeenCalledWith(
      'No tiene permiso para realizar esta acción.',
      'error',
      6000
    );
  });

  it('should redirect to login on 419 error', () => {
    http.get('/test').subscribe({
      error: (error) => expect(error).toBeTruthy()
    });

    const req = httpTestingController.expectOne('/test');
    req.flush('Page Expired', { status: 419, statusText: 'Page Expired' });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
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
