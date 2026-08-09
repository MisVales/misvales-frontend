import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationApiService } from '../data-access/organization-api.service';
import { Branch } from '../data-access/organization.dtos';
import { OrganizationFacade } from './organization.facade';

describe('OrganizationFacade', () => {
  let facade: InstanceType<typeof OrganizationFacade>;
  let api: {
    getBranches: ReturnType<typeof vi.fn>;
    getBranch: ReturnType<typeof vi.fn>;
    createBranch: ReturnType<typeof vi.fn>;
    updateBranch: ReturnType<typeof vi.fn>;
    changeBranchStatus: ReturnType<typeof vi.fn>;
  };

  const branch: Branch = {
    id: '1',
    code: 'SUC-001',
    name: 'Sede Principal',
    address: 'Blvd. Independencia 100, Torreón, Coahuila, 27000',
    is_headquarters: true,
    status: 'ACTIVE',
    lock_version: 1,
  };

  beforeEach(() => {
    api = {
      getBranches: vi.fn(),
      getBranch: vi.fn(),
      createBranch: vi.fn(),
      updateBranch: vi.fn(),
      changeBranchStatus: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: OrganizationApiService, useValue: api }],
    });
    facade = TestBed.inject(OrganizationFacade);
  });

  it('carga sucursales con la paginación del backend', async () => {
    api.getBranches.mockReturnValue(of({
      data: [branch],
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 },
    }));

    await facade.loadBranches();

    expect(facade.branches()).toEqual([branch]);
    expect(facade.total()).toBe(1);
    expect(facade.isLoading()).toBe(false);
  });

  it('consulta el detalle directamente en la API', async () => {
    api.getBranch.mockReturnValue(of(branch));

    await facade.getBranchById(branch.id);

    expect(api.getBranch).toHaveBeenCalledWith(branch.id);
    expect(facade.selectedBranch()).toEqual(branch);
  });

  it('crea una sucursal y actualiza el estado local', async () => {
    api.createBranch.mockReturnValue(of(branch));

    expect(await facade.createBranch({ name: branch.name, address: branch.address! })).toBe(true);
    expect(facade.branches()).toEqual([branch]);
  });

  it('conserva un error legible cuando falla la carga', async () => {
    api.getBranches.mockReturnValue(throwError(() => new Error('network')));

    await facade.loadBranches();

    expect(facade.error()).toBe('Error al cargar sucursales.');
  });
});
