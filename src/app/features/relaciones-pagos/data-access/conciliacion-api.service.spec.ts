import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '../../../core/api/api.config';
import { ConciliacionApiService } from './conciliacion-api.service';
describe('ConciliacionApiService', () => {
  let service: ConciliacionApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConciliacionApiService, { provide: API_CONFIG, useValue: defaultApiConfig }],
    });
    service = TestBed.inject(ConciliacionApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });
  it('carga el XLSX como multipart sin inventar integración bancaria', () => {
    const file = new File(['xlsx'], 'bank.xlsx');
    service.upload(file).subscribe((v) => expect(v.status).toBe('PROCESSED'));
    const req = http.expectOne((r) => r.url.endsWith('/bank-imports'));
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).get('file')).toBe(file);
    req.flush({ data: { status: 'PROCESSED' } });
  });
  it('consulta movimientos conciliados paginados', () => {
    service.movements().subscribe((items) => expect(items[0].classification).toBe('SETTLEMENT'));
    const req = http.expectOne((request) => request.url.endsWith('/bank-movements'));
    req.flush({ data: { data: [{ id: 'm1', classification: 'SETTLEMENT' }] } });
  });
});
