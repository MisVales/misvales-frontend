import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '../../../core/api/api.config';
import { ValesApiService } from './vales-api.service';

describe('ValesApiService', () => {
  let service: ValesApiService; let http: HttpTestingController;
  beforeEach(() => { TestBed.resetTestingModule(); TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [ValesApiService, { provide: API_CONFIG, useValue: defaultApiConfig }] }); service = TestBed.inject(ValesApiService); http = TestBed.inject(HttpTestingController); });
  afterEach(() => { http.verify(); TestBed.resetTestingModule(); });

  it('obtiene únicamente productos publicables desde el backend', () => { service.listarProductos().subscribe(); const request = http.expectOne('/api/v1/voucher-products'); expect(request.request.method).toBe('GET'); request.flush({ data: [] }); });
  it('previsualiza sólo con el producto elegido por la distribuidora', () => { service.previsualizar('c1', 'pv1').subscribe(); const request = http.expectOne('/api/v1/vouchers/preview'); expect(request.request.body).toEqual({ client_id: 'c1', product_version_id: 'pv1' }); request.flush({ data: {} }); });
  it('genera con clave idempotente y conserva strings decimales', () => { service.generar('c1', 'pv1').subscribe(value => expect(value.capital).toBe('10000.0000')); const request = http.expectOne('/api/v1/vouchers'); expect(request.request.headers.get('Idempotency-Key')).toBeTruthy(); expect(request.request.body).toEqual({ client_id: 'c1', product_version_id: 'pv1' }); request.flush({ data: { capital: '10000.0000' } }); });
  it('consulta los vales históricos de un cliente sin filtrar productos operativos en frontend', () => { service.listar(1, '', 'client-1').subscribe(); const request = http.expectOne((candidate) => candidate.url === '/api/v1/vouchers'); expect(request.request.params.get('client_id')).toBe('client-1'); expect(request.request.params.get('page')).toBe('1'); request.flush({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } }); });
});
