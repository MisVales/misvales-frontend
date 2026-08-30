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

  it('lista los vales pendientes de Caja', () => {
    service.list('pending').subscribe();
    const request = http.expectOne((item) => item.url.endsWith('/cashier/vouchers'));
    expect(request.request.params.get('scope')).toBe('pending');
    expect(request.request.params.get('per_page')).toBe('50');
    request.flush({ data: [] });
  });

  it('busca vales con el termino recibido', () => {
    service.search('MV-10').subscribe((items) => expect(items[0].folio).toBe('MV-10'));
    const request = http.expectOne((item) => item.url.endsWith('/cashier/vouchers/search'));
    expect(request.request.params.get('search')).toBe('MV-10');
    request.flush({ data: [{ id: '1', folio: 'MV-10' }] });
  });

  it('feria por transferencia con transaccion, CLABE, version e idempotencia', () => {
    service.cash('voucher-1', 'TRANSFER', '123456', '012345678901234567', 4).subscribe();
    const request = http.expectOne((item) => item.url.endsWith('/cashier/vouchers/voucher-1/cash'));
    expect(request.request.body).toEqual({
      payment_method: 'TRANSFER',
      bank_transaction_number: '123456',
      clabe: '012345678901234567',
      lock_version: 4,
    });
    expect(request.request.headers.get('Idempotency-Key')).toBeTruthy();
    request.flush({ data: {} });
  });

  it('captura los cambios sin motivo al crear la solicitud', () => {
    service.requestModification('voucher-1', ['curp'], { curp: 'GODE561231HDFABC09' }).subscribe();
    const request = http.expectOne((item) =>
      item.url.endsWith('/cashier/vouchers/voucher-1/modification-requests'),
    );
    expect(request.request.body).toEqual({
      fields: ['curp'],
      changes: { curp: 'GODE561231HDFABC09' },
    });
    request.flush({ data: {} });
  });

  it('aplica la correccion con token y datos tecnicos internos', () => {
    service.apply('request-1', 'A1B2C3D4', 2).subscribe();
    const request = http.expectOne((item) =>
      item.url.endsWith('/voucher-modification-requests/request-1/apply'),
    );
    expect(request.request.body).toEqual({
      token: 'A1B2C3D4',
      lock_version: 2,
    });
    request.flush({ data: {} });
  });
});
