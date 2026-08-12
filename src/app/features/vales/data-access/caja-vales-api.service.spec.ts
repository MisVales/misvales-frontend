import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '../../../core/api/api.config';
import { CajaValesApiService } from './caja-vales-api.service';

describe('CajaValesApiService', () => {
  let service: CajaValesApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CajaValesApiService, { provide: API_CONFIG, useValue: defaultApiConfig }],
    });
    service = TestBed.inject(CajaValesApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('busca vales con el término recibido', () => {
    service.search('MV-10').subscribe((items) => expect(items[0].folio).toBe('MV-10'));
    const request = http.expectOne((item) => item.url.endsWith('/cashier/vouchers/search'));
    expect(request.request.params.get('search')).toBe('MV-10');
    request.flush({ data: [{ id: '1', folio: 'MV-10' }] });
  });

  it('feria con transacción, versión e idempotencia', () => {
    service.cash('voucher-1', 'TX-001', 4).subscribe();
    const request = http.expectOne((item) => item.url.endsWith('/cashier/vouchers/voucher-1/cash'));
    expect(request.request.body).toEqual({ bank_transaction_number: 'TX-001', lock_version: 4 });
    expect(request.request.headers.get('Idempotency-Key')).toBeTruthy();
    request.flush({ data: {} });
  });

  it('aplica únicamente el conjunto de cambios enviado con el token', () => {
    service.apply('request-1', 'A1B2C3D4', { curp: 'CURP' }, 2).subscribe();
    const request = http.expectOne((item) =>
      item.url.endsWith('/voucher-modification-requests/request-1/apply'),
    );
    expect(request.request.body).toEqual({
      token: 'A1B2C3D4',
      changes: { curp: 'CURP' },
      lock_version: 2,
    });
    request.flush({ data: {} });
  });
});
