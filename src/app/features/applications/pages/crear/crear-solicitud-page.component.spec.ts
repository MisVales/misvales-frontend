import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionStore } from '../../../../core/session/session.store';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { CrearSolicitudPageComponent } from './crear-solicitud-page.component';

describe('CrearSolicitudPageComponent catalogs', () => {
  const organizationApi = {
    getBranches: vi.fn(),
    getBranchAssignments: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: OrganizationApiService, useValue: organizationApi },
        {
          provide: SolicitudDetalleStore,
          useValue: { guardandoSeccion: () => false, error: () => null, crearSolicitud: vi.fn() },
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });
  });

  it('publishes the API branch response through a signal in zoneless mode', async () => {
    TestBed.inject(SessionStore).setSession(
      { id: 'manager', name: 'Gerencia', email: 'manager@example.test' },
      ['general_manager'],
      ['distributor_applications.create'],
      null,
    );
    organizationApi.getBranches.mockReturnValue(of({
      data: [
        { id: 'a', code: 'MATRIZ', name: 'Matriz', address: null, is_headquarters: true, status: 'ACTIVE', lock_version: 1 },
        { id: 'b', code: 'SUC-001', name: 'Sucursal B', address: null, is_headquarters: false, status: 'ACTIVE', lock_version: 1 },
      ],
      meta: { current_page: 1, last_page: 1, per_page: 100, total: 2 },
    }));
    const component = TestBed.runInInjectionContext(() => new CrearSolicitudPageComponent());

    await component.ngOnInit();

    expect(component.branches().map((branch) => branch.id)).toEqual(['a', 'b']);
  });

  it('uses the authenticated coordinator scope without requesting the global branch catalog', async () => {
    TestBed.inject(SessionStore).setSession(
      { id: 'coordinator-a', name: 'Coordinación A', email: 'coordinator@example.test' },
      ['coordinator'],
      ['distributor_applications.create'],
      'branch-a',
    );
    const component = TestBed.runInInjectionContext(() => new CrearSolicitudPageComponent());

    await component.ngOnInit();

    expect(organizationApi.getBranches).not.toHaveBeenCalled();
    expect(component.crearForm.getRawValue()).toEqual({
      branch_id: 'branch-a',
      coordinator_id: 'coordinator-a',
    });
  });
});
