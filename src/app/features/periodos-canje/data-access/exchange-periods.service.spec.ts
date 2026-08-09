import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PeriodosCanjeService } from './exchange-periods.service';
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
    const mockData = {
      datos: [{ id: '1', nombre: 'Periodo 1', fechaInicio: '2023-01-01', fechaFin: '2023-01-31', valorPunto: '1.5', estado: 'vigente', responsable: 'Admin' }],
      total: 1, pagina: 1, porPagina: 10
    };

    service.listar().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/v1/exchange-periods?page=1&perPage=10');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
