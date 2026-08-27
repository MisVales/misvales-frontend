import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '../../core/api/api.config';
import { CentroOperacionApiService } from './centro-operacion-api.service';
describe('CentroOperacionApiService', () => {
  let service: CentroOperacionApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CentroOperacionApiService, { provide: API_CONFIG, useValue: defaultApiConfig }],
    });
    service = TestBed.inject(CentroOperacionApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  it('consulta el estado operativo integrado', () => {
    service.readiness().subscribe((health) => expect(health.checks['scheduler']).toBe(true));
    const request = http.expectOne((item) => item.url.endsWith('/health/readiness'));
    request.flush({
      status: 'ready',
      checks: { mariadb: true, redis: true, private_storage: true, scheduler: true },
      failed_jobs: 0,
      queued_jobs: 0,
      checked_at: '2026-08-12T20:00:00-06:00',
    });
  });
  it('fuerza la fecha límite con idempotencia y conserva el resumen de resultados', () => {
    service.forcePaymentDeadline('Cierre de prueba', 'deadline-key').subscribe((result) => {
      expect(result.status).toBe('COMPLETED');
      expect(result.outcomes?.partially_paid).toBe(2);
    });
    const request = http.expectOne((item) => item.url.endsWith('/operations/force-payment-deadline'));
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Idempotency-Key')).toBe('deadline-key');
    expect(request.request.body).toEqual({ motivo: 'Cierre de prueba' });
    request.flush({
      data: {
        success: true,
        replayed: false,
        status: 'COMPLETED',
        process_run_id: 'run-1',
        evaluated_at: '2026-09-15T05:59:59+00:00',
        outcomes: { settled: 1, partially_paid: 2, unpaid: 3 },
      },
    });
  });
});
