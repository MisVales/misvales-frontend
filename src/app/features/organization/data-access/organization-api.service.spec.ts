import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';
import { Branch } from './organization.dtos';
import { OrganizationApiService } from './organization-api.service';

describe('OrganizationApiService', () => {
  let service: OrganizationApiService;
  let http: HttpTestingController;
  const branch: Branch = {
    id: '1', code: 'SUC-001', name: 'Sede Principal', is_headquarters: true,
    address: 'Blvd. Independencia 100, Torreón, Coahuila, 27000',
    status: 'ACTIVE', lock_version: 1, created_at: '2026-01-01', updated_at: '2026-01-01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OrganizationApiService,
        { provide: API_CONFIG, useValue: { baseUrl: '/api/v1' } },
      ],
    });
    service = TestBed.inject(OrganizationApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista las sucursales autorizadas por el backend', async () => {
    const result = firstValueFrom(service.getBranches());
    const request = http.expectOne('/api/v1/branches');
    expect(request.request.method).toBe('GET');
    request.flush({ data: [branch], meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 } });
    expect((await result).data).toEqual([branch]);
  });

  it('crea una sucursal con el contrato vigente', async () => {
    const payload = { name: 'Sede Principal', address: 'Blvd. Independencia 100, Torreón, Coahuila, 27000' };
    const result = firstValueFrom(service.createBranch(payload));
    const request = http.expectOne('/api/v1/branches');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: branch });
    expect(await result).toEqual(branch);
  });

  it('actualiza nombre y dirección de una sucursal', async () => {
    service.updateBranch('1', { name: 'Sede Norte', address: branch.address!, lock_version: 1 }).subscribe();
    const request = http.expectOne('/api/v1/branches/1');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.headers.get('If-Match')).toBe('"1"');
    request.flush({ data: { ...branch, name: 'Sede Norte', lock_version: 2 } });
  });

  it('cambia el estado de una sucursal', async () => {
    service.changeBranchStatus(branch, false).subscribe();
    const request = http.expectOne('/api/v1/branches/1/deactivate');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('If-Match')).toBe('"1"');
    request.flush({ data: { ...branch, status: 'INACTIVE', lock_version: 2 } });
  });
});
