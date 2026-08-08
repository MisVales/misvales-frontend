import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfiguracionesService } from './configurations.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfiguracionDTO } from './configurations.dtos';
import { API_CONFIG, defaultApiConfig } from '@core/api/api.config';

describe('ConfiguracionesService', () => {
  let service: ConfiguracionesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ConfiguracionesService,
        { provide: API_CONFIG, useValue: defaultApiConfig }
      ]
    });
    service = TestBed.inject(ConfiguracionesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería listar configuraciones', () => {
    const mockData = {
      datos: [{ id: '1', clave: 'CFG_MAX_CRED', nombre: 'Test', valorVigente: '100', tipo: 'importe', inicioVigencia: '2023-01-01', versionRegistro: 1, estado: 'publicado', grupo: 'Crédito' }],
      total: 1, pagina: 1, porPagina: 10
    };

    service.listar().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/v1/configurations?page=1&perPage=10');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
