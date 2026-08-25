import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '../../../core/api/api.config';
import { ExcedentesApiService } from './excedentes-api.service';
describe('ExcedentesApiService', () => {
  let service: ExcedentesApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExcedentesApiService, { provide: API_CONFIG, useValue: defaultApiConfig }],
    });
    service = TestBed.inject(ExcedentesApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  it('reserva el excedente para devolución mediante acción explícita', () => {
    service.refund('s1').subscribe((v) => expect(v.status).toBe('REQUESTED'));
    const req = http.expectOne((r) => r.url.endsWith('/surpluses/s1/refund-requests'));
    expect(req.request.headers.get('Idempotency-Key')).toBeTruthy();
    req.flush({ data: { status: 'REQUESTED' } });
  });

  it('completa una devolución con importe, fecha y comprobante privado', () => {
    service
      .execute('r1', {
        amount: '700.0000',
        executed_at: '2026-08-21T10:00:00-06:00',
        method: 'TRANSFERENCIA_EXTERNA',
        reference: 'FOLIO-01',
        evidence_media_id: 'm1',
        observations: 'Confirmada por caja',
      })
      .subscribe((value) => expect(value.status).toBe('EXECUTED'));
    const req = http.expectOne((request) => request.url.endsWith('/refund-requests/r1/execute'));
    expect(req.request.body.amount).toBe('700.0000');
    expect(req.request.body.evidence_media_id).toBe('m1');
    expect(req.request.headers.get('Idempotency-Key')).toBeTruthy();
    req.flush({ data: { status: 'EXECUTED' } });
  });

  it('cancela conservando un motivo explícito', () => {
    service.cancel('r1', 'La distribuidora reconsideró la solicitud').subscribe();
    const req = http.expectOne((request) => request.url.endsWith('/refund-requests/r1/cancel'));
    expect(req.request.body.reason).toContain('reconsideró');
    req.flush({ data: { status: 'CANCELLED' } });
  });
});
