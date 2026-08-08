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
    request.flush([branch]);
    expect(await result).toEqual([branch]);
  });

  it('crea una sucursal con el contrato vigente', async () => {
    const result = firstValueFrom(service.createBranch({ code: 'SUC-001', name: 'Sede Principal' }));
    const request = http.expectOne('/api/v1/branches');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ code: 'SUC-001', name: 'Sede Principal' });
    request.flush(branch);
    expect(await result).toEqual(branch);
  });

  it('actualiza el nombre de una sucursal', async () => {
    service.updateBranch('1', { name: 'Sede Norte' }).subscribe();
    const request = http.expectOne('/api/v1/branches/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ name: 'Sede Norte' });
    request.flush({ ...branch, name: 'Sede Norte' });
  });

  it('cambia el estado de una sucursal', async () => {
    service.toggleBranchStatus('1', { status: 'INACTIVE' }).subscribe();
    const request = http.expectOne('/api/v1/branches/1/status');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'INACTIVE' });
    request.flush({ ...branch, status: 'INACTIVE' });
  });
});
