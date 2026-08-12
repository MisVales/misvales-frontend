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
  it('consulta reportes paginados con filtros sin cargar el universo', () => {
    service
      .report('credit-lines', { status: 'ACTIVE' })
      .subscribe((page) => expect(page.total).toBe(1));
    const request = http.expectOne((item) => item.url.endsWith('/reports/credit-lines'));
    expect(request.request.params.get('status')).toBe('ACTIVE');
    request.flush({ data: { data: [{ id: '1' }], current_page: 1, last_page: 1, total: 1 } });
  });
});
