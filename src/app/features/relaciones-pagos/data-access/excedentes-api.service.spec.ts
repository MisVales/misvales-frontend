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
});
