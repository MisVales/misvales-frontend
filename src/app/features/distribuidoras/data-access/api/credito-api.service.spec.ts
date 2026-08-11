import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_CONFIG, defaultApiConfig } from '../../../../core/api/api.config';
import { CreditoApiService } from './credito-api.service';

describe('CreditoApiService', () => {
  let service: CreditoApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [CreditoApiService, { provide: API_CONFIG, useValue: defaultApiConfig }] });
    service = TestBed.inject(CreditoApiService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

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
});
