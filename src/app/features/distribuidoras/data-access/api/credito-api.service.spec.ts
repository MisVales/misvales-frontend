import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG, defaultApiConfig } from '../../../../core/api/api.config';
import { CreditoApiService } from './credito-api.service';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

describe('CreditoApiService', () => {
  let service: CreditoApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [CreditoApiService, { provide: API_CONFIG, useValue: defaultApiConfig }] });
    service = TestBed.inject(CreditoApiService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('consulta únicamente líneas reales de las distribuidoras y omite las inexistentes', () => {
    let result: any[] = [];
    service.listarLineas().subscribe(value => result = value);
    http.expectOne('/api/v1/distributors?per_page=100').flush({ data: [{ id: 'd1' }, { id: 'd2' }] });
    http.expectOne('/api/v1/distributors/d1/credit-line').flush({ data: { id: 'l1', distributor: { id: 'd1' } } });
    http.expectOne('/api/v1/distributors/d2/credit-line').flush({ message: 'Sin línea' }, { status: 404, statusText: 'Not Found' });
    expect(result.map(line => line.id)).toEqual(['l1']);
  });

  it('envía paginación canónica para incrementos existentes de M08', () => {
    service.listarIncrementos(2).subscribe();
    const request = http.expectOne('/api/v1/credit-increase-requests?page=2&per_page=15');
    expect(request.request.method).toBe('GET');
    request.flush({ data: [], meta: { current_page: 2, last_page: 2, total: 15 } });
  });

  it('crea una solicitud con decimal exacto, versión e idempotencia', () => {
    service.solicitarIncremento('d1', '10000.0000', 'Mayor demanda', 3).subscribe();
    const request = http.expectOne('/api/v1/distributors/d1/credit-increase-requests');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Idempotency-Key')).toBeTruthy();
    expect(request.request.body).toEqual({ requested_amount: '10000.0000', request_reason: 'Mayor demanda', lock_version: 3 });
    request.flush({ data: { id: 'r1', lock_version: 1 } });
  });

  it('envía la preautorización con importe y versión de bloqueo', () => {
    service.revisarIncremento('r1', '8000.0000', 'Historial favorable', 1).subscribe();
    const request = http.expectOne('/api/v1/credit-increase-requests/r1/preauthorize');
    expect(request.request.body).toEqual({ recommended_amount: '8000.0000', reason: 'Historial favorable', lock_version: 1 });
    request.flush({ data: { id: 'r1', lock_version: 2 } });
  });

  it('solo incluye importe autorizado en una autorización parcial', () => {
    service.decidir('r1', 'APPROVE_LOWER', 'Importe prudente', 2, '7000.0000').subscribe();
    const request = http.expectOne('/api/v1/credit-increase-requests/r1/manager-decision');
    expect(request.request.body).toEqual({ decision: 'APPROVE_LOWER', reason: 'Importe prudente', lock_version: 2, authorized_amount: '7000.0000' });
    request.flush({ data: { id: 'r1', lock_version: 3 } });
  });
});
