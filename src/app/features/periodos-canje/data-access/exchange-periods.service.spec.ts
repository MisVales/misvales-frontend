import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PeriodosCanjeService } from './periodos-canje.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '@core/api/api.config';

describe('PeriodosCanjeService', () => {
  let service: PeriodosCanjeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PeriodosCanjeService,
        { provide: API_CONFIG, useValue: defaultApiConfig }
      ]
    });
    service = TestBed.inject(PeriodosCanjeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería listar periodos de canje', () => {
    const apiData = [{ id: '1', code: 'P-1', name: 'Periodo 1', description: null, starts_at: '2023-01-01', ends_at: '2023-01-31', status: 'CLOSED' as const, created_at: '2022-12-01', lock_version: 0 }];

    service.listar().subscribe(data => {
      expect(data).toEqual({
        data: [{ id: '1', code: 'P-1', name: 'Periodo 1', description: null, start_date: '2023-01-01', end_date: '2023-01-31', status: 'CLOSED', created_at: '2022-12-01', lock_version: 0 }],
        meta: { current_page: 1, last_page: 1, total: 1 },
      });
    });

    const req = httpMock.expectOne('/api/v1/redemption-periods?page=1&per_page=10');
    expect(req.request.method).toBe('GET');
    req.flush(apiData);
  });
});
