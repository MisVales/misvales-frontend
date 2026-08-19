import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionStore } from '../../../../core/session/session.store';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { CrearSolicitudPageComponent } from './crear-solicitud-page.component';
import { AlertService } from '../../../../shared/services/alert.service';

describe('CrearSolicitudPageComponent catalogs', () => {
  const organizationApi = {
    getBranches: vi.fn(),
    getBranchAssignments: vi.fn(),
  };
  const store = { guardandoSeccion: () => false, error: () => null, crearSolicitud: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: OrganizationApiService, useValue: organizationApi },
        {
          provide: SolicitudDetalleStore,
          useValue: store,
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });
  });

  it('loads the global branch catalog only for a general manager', async () => {
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

    expect(organizationApi.getBranches).toHaveBeenCalledWith({
      per_page: 100,
      status: 'ACTIVE',
    });
    expect(organizationApi.getBranchAssignments).not.toHaveBeenCalled();
    expect(component.branches().map((branch) => branch.id)).toEqual(['a', 'b']);
    expect(component.catalogError()).toBeNull();
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
    expect(organizationApi.getBranchAssignments).not.toHaveBeenCalled();
    expect(component.catalogError()).toBeNull();
  });

  it('loads only the active branch assignments for a branch manager', async () => {
    TestBed.inject(SessionStore).setSession(
      { id: 'manager-a', name: 'Gerencia A', email: 'manager-a@example.test' },
      ['branch_manager'],
      ['distributor_applications.create'],
      'branch-a',
    );
    organizationApi.getBranchAssignments.mockReturnValue(
      of({
        data: [
          assignment('active-coordinator', 'coordinator', 'ACTIVE'),
          assignment('ended-coordinator', 'coordinator', 'ENDED'),
          assignment('active-verifier', 'verifier', 'ACTIVE'),
        ],
      }),
    );
    const component = TestBed.runInInjectionContext(() => new CrearSolicitudPageComponent());

    await component.ngOnInit();

    expect(organizationApi.getBranches).not.toHaveBeenCalled();
    expect(organizationApi.getBranchAssignments).toHaveBeenCalledWith('branch-a');
    expect(component.coordinators().map((candidate) => candidate.user.id)).toEqual([
      'active-coordinator',
    ]);
    expect(component.crearForm.controls.branch_id.value).toBe('branch-a');
  });

  it('fails closed when a scoped role has no active branch context', async () => {
    TestBed.inject(SessionStore).setSession(
      { id: 'coordinator-a', name: 'Coordinación A', email: 'coordinator@example.test' },
      ['coordinator'],
      ['distributor_applications.create'],
      null,
    );
    const component = TestBed.runInInjectionContext(() => new CrearSolicitudPageComponent());

    await component.ngOnInit();

    expect(organizationApi.getBranches).not.toHaveBeenCalled();
    expect(organizationApi.getBranchAssignments).not.toHaveBeenCalled();
    expect(component.crearForm.invalid).toBe(true);
    expect(component.catalogError()).toContain('sucursal activa');
  });

  it('notifica al crear el expediente', async () => {
    const alerts = TestBed.inject(AlertService);
    const success = vi.spyOn(alerts, 'success');
    store.crearSolicitud.mockResolvedValue('solicitud-nueva');
    const component = TestBed.runInInjectionContext(() => new CrearSolicitudPageComponent());
    component.crearForm.setValue({ branch_id: 'branch-a', coordinator_id: 'coordinator-a' });

    await component.onSubmit();

    expect(store.crearSolicitud).toHaveBeenCalledWith({ branch_id: 'branch-a', coordinator_id: 'coordinator-a' });
    expect(success).toHaveBeenCalledWith('El expediente se creó correctamente.');
  });
});

function assignment(
  userId: string,
  roleCode: string,
  status: 'ACTIVE' | 'ENDED' | 'REVOKED',
) {
  return {
    assignment_id: `assignment-${userId}`,
    user: { id: userId, name: userId, email: `${userId}@example.test`, state: 'ACTIVE' },
    role: { id: `role-${roleCode}`, code: roleCode, name: roleCode },
    branch_id: 'branch-a',
    scope: 'BRANCH' as const,
    assignment_status: status,
    assigned_at: '2026-08-18T00:00:00Z',
    assignment_reason: null,
    revoked_at: null,
    revocation_reason: null,
  };
}
