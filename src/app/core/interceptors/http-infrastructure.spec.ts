import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  COMMAND_CONTEXT,
  CORRELATION_CONTEXT,
  createCommandContext,
  createCorrelationContext,
  INTERNAL_API_REQUEST,
} from '@core/api/api-request.context';
import { NormalizedApiError } from '@core/api/api-response.models';
import { APP_CONFIG } from '@core/config/app-config.token';
import { RequestSupportService } from '@core/error-handling/request-support.service';

import { apiUrlInterceptor } from './api-url.interceptor';
import { commandInterceptor } from './command.interceptor';
import { correlationInterceptor } from './correlation.interceptor';
import { credentialsInterceptor } from './credentials.interceptor';
import { errorNormalizationInterceptor } from './error-normalization.interceptor';

describe('HTTP infrastructure', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(
          withInterceptors([
            apiUrlInterceptor,
            credentialsInterceptor,
            correlationInterceptor,
            commandInterceptor,
            errorNormalizationInterceptor,
          ]),
        ),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('prefixes only opted-in API paths and sets private request headers', async () => {
    const promise = firstValueFrom(
      http.get('/widgets', {
        context: new HttpContext().set(INTERNAL_API_REQUEST, true),
      }),
    );
    const request = controller.expectOne('/api/v1/widgets');

    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('Accept')).toBe('application/json');
    expect(request.request.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    request.flush({ data: [] });

    await promise;
  });

  it('does not modify external requests', async () => {
    const promise = firstValueFrom(http.get('https://example.test/status'));
    const request = controller.expectOne('https://example.test/status');

    expect(request.request.withCredentials).toBe(false);
    expect(request.request.headers.has('X-Requested-With')).toBe(false);
    request.flush({ ok: true });

    await promise;
  });

  it('reuses command identity and sends documented concurrency headers', async () => {
    const command = createCommandContext({ idempotency: true, ifMatch: '7' });
    const context = new HttpContext().set(INTERNAL_API_REQUEST, true).set(COMMAND_CONTEXT, command);
    const first = firstValueFrom(http.post('/commands', {}, { context }));
    const firstRequest = controller.expectOne('/api/v1/commands');
    const firstKey = firstRequest.request.headers.get('Idempotency-Key');

    expect(firstKey).toBe(command.idempotencyKey);
    expect(firstRequest.request.headers.get('If-Match')).toBe('7');
    firstRequest.flush({ data: {} });
    await first;

    const second = firstValueFrom(http.post('/commands', {}, { context }));
    const secondRequest = controller.expectOne('/api/v1/commands');
    expect(secondRequest.request.headers.get('Idempotency-Key')).toBe(firstKey);
    secondRequest.flush({ data: {} });
    await second;
  });

  it('adds correlation headers only when a request opts in', async () => {
    const context = new HttpContext()
      .set(INTERNAL_API_REQUEST, true)
      .set(CORRELATION_CONTEXT, createCorrelationContext('trace-action'));
    const promise = firstValueFrom(http.get('/context', { context }));
    const request = controller.expectOne('/api/v1/context');

    expect(request.request.headers.get('X-Trace-Id')).toBe('trace-action');
    expect(request.request.headers.get('X-Request-Id')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    request.flush({ data: {} });
    await promise;
  });

  it('retries a GET once for a documented transient response', async () => {
    const context = new HttpContext()
      .set(INTERNAL_API_REQUEST, true)
      .set(CORRELATION_CONTEXT, createCorrelationContext());
    const promise = firstValueFrom(http.get('/items', { context }));
    const initial = controller.expectOne('/api/v1/items');
    const initialRequestId = initial.request.headers.get('X-Request-Id');
    initial.flush(null, { status: 503, statusText: 'Unavailable' });
    const retried = controller.expectOne('/api/v1/items');
    expect(retried.request.headers.get('X-Request-Id')).not.toBe(initialRequestId);
    retried.flush({ data: [] });

    await expect(promise).resolves.toEqual({ data: [] });
  });

  it('renews CSRF and repeats a mutation once with the same command key', async () => {
    const command = createCommandContext({ idempotency: true });
    const context = new HttpContext().set(INTERNAL_API_REQUEST, true).set(COMMAND_CONTEXT, command);
    const promise = firstValueFrom(http.post('/commands', { value: 'safe' }, { context }));
    const initial = controller.expectOne('/api/v1/commands');
    expect(initial.request.headers.get('Idempotency-Key')).toBe(command.idempotencyKey);
    initial.flush(null, { status: 419, statusText: 'Page Expired' });

    controller.expectOne('/sanctum/csrf-cookie').flush(null);
    const retried = controller.expectOne('/api/v1/commands');
    expect(retried.request.headers.get('Idempotency-Key')).toBe(command.idempotencyKey);
    retried.flush({ data: {} });

    await promise;
  });

  it('normalizes field errors and captures the support request id', async () => {
    const promise = firstValueFrom(
      http.post('/validation', {}, { context: new HttpContext().set(INTERNAL_API_REQUEST, true) }),
    );
    controller.expectOne('/api/v1/validation').flush(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Revisa los campos.',
          fields: { email: ['El correo no es válido.'] },
          details: { trace: 'not exposed' },
          request_id: '00000000-0000-4000-8000-000000000123',
        },
      },
      { status: 422, statusText: 'Unprocessable Entity' },
    );

    let error: NormalizedApiError | null = null;
    try {
      await promise;
    } catch (reason: unknown) {
      error = reason as NormalizedApiError;
    }
    if (!error) {
      throw new Error('Expected the request to fail.');
    }
    expect(error.status).toBe(422);
    expect(error.fields['email']).toEqual(['El correo no es válido.']);
    expect(error.details).toEqual({});
    expect(TestBed.inject(RequestSupportService).lastRequestId()).toBe(
      '00000000-0000-4000-8000-000000000123',
    );
  });

  it('honors Retry-After and message-only exceptional responses', async () => {
    const promise = firstValueFrom(
      http.post('/limited', {}, { context: new HttpContext().set(INTERNAL_API_REQUEST, true) }),
    );
    controller.expectOne('/api/v1/limited').flush(
      { message: 'Intenta más tarde.' },
      {
        status: 429,
        statusText: 'Too Many Requests',
        headers: { 'Retry-After': '3', 'X-Request-Id': 'request-from-header' },
      },
    );

    let error: NormalizedApiError | null = null;
    try {
      await promise;
    } catch (reason: unknown) {
      error = reason as NormalizedApiError;
    }

    expect(error?.message).toBe('Intenta más tarde.');
    expect(error?.retryAfterSeconds).toBe(3);
    expect(error?.request_id).toBe('request-from-header');
    expect(TestBed.inject(RequestSupportService).blockedUntil()).toBeGreaterThan(Date.now());
  });

  it('stops after the single GET retry and reports an unconfirmed offline operation', async () => {
    const promise = firstValueFrom(
      http.get('/offline', {
        context: new HttpContext().set(INTERNAL_API_REQUEST, true),
      }),
    );
    controller.expectOne('/api/v1/offline').error(new ProgressEvent('network'));
    controller.expectOne('/api/v1/offline').error(new ProgressEvent('network'));

    let error: NormalizedApiError | null = null;
    try {
      await promise;
    } catch (reason: unknown) {
      error = reason as NormalizedApiError;
    }

    expect(error?.offline).toBe(true);
    expect(error?.code).toBe('NETWORK_UNCONFIRMED');
    expect(error?.request_id).toBeNull();
  });

  it('uses the approved immutable environment values', () => {
    const config = TestBed.inject(APP_CONFIG);
    expect(config.apiBaseUrl).toBe('/api/v1');
    expect(config.csrfUrl).toBe('/sanctum/csrf-cookie');
    expect(config.businessTimezone).toBe('America/Monterrey');
    expect(config.locale).toBe('es-MX');
    expect(config.logPayloads).toBe(false);
  });
});
