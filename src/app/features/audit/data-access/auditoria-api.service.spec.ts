import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG } from '../../../core/api/api.config';
import { AuditoriaApiService } from './auditoria-api.service';

describe('AuditoriaApiService', () => {
  let service: AuditoriaApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuditoriaApiService, { provide: API_CONFIG, useValue: { baseUrl: '/api/v1' } }],
    });
    service = TestBed.inject(AuditoriaApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('envía todos los eventos seleccionados sin convertirlos en una lista incompleta', () => {
    service
      .getAudits({
        event_names: ['BRANCH_CREATED', 'VOUCHER_GENERATED'],
        entity_type: 'branches',
      })
      .subscribe();

    const request = http.expectOne((item) => item.url === '/api/v1/audit-logs');
    expect(request.request.params.getAll('event_names[]')).toEqual([
      'BRANCH_CREATED',
      'VOUCHER_GENERATED',
    ]);
    expect(request.request.params.get('entity_type')).toBe('branches');
    request.flush({ data: { data: [] } });
  });

  it('clasifica creaciones de distintos módulos y conserva una categoría para eventos futuros', () => {
    expect(service.getActionGroup('BRANCH_CREATED')).toBe('CREATE');
    expect(service.getActionGroup('VOUCHER_GENERATED')).toBe('CREATE');
    expect(service.getActionGroup('INVITATION_RESENT')).toBe('ACCESS');
    expect(service.getActionGroup('FUTURE_DOMAIN_EVENT')).toBe('OTHER');
  });

  it('consulta el catálogo real de filtros y las trazas de endpoints', () => {
    service.getFilterOptions().subscribe();
    http.expectOne('/api/v1/audit-logs/options').flush({
      data: { events: [], actor_roles: [], results: [] },
    });

    service.getOperationalLogs({ search: 'trace-1', channel: 'OPERATION' }).subscribe();
    const request = http.expectOne((item) => item.url === '/api/v1/operational-logs');
    expect(request.request.params.get('search')).toBe('trace-1');
    expect(request.request.params.get('channel')).toBe('OPERATION');
    request.flush({ data: { data: [] } });
  });

  it('describe acciones legibles para eventos comunes de auditoría', () => {
    const auditLogin = {
      id: '1',
      actor_id: 'u1',
      actor_role: 'admin',
      event_name: 'LOGIN_SUCCESSFUL',
      result: 'SUCCESS' as const,
      created_at: '2026-08-28T12:00:00Z',
      updated_at: '2026-08-28T12:00:00Z',
      actor: { id: 'u1', name: 'Administrador Demo', email: 'admin@misvales.com' },
    };
    expect(service.describeAction(auditLogin)).toBe('Administrador Demo inició sesión');

    const auditClient = {
      id: '2',
      actor_id: 'u2',
      actor_role: 'coordinator',
      event_name: 'CLIENT_CREATED',
      result: 'SUCCESS' as const,
      created_at: '2026-08-28T12:00:00Z',
      updated_at: '2026-08-28T12:00:00Z',
      actor: { id: 'u2', name: 'Coordinador Demo', email: 'coord@misvales.com' },
      new_value: { name: 'Juan Pérez' },
    };
    expect(service.describeAction(auditClient)).toBe('Coordinador Demo dio de alta al cliente "Juan Pérez"');
  });

  it('detecta y formatea campos modificados correctamente', () => {
    const auditEdit = {
      id: '3',
      actor_id: 'u3',
      actor_role: 'verifier',
      event_name: 'CLIENT_UPDATED',
      result: 'SUCCESS' as const,
      created_at: '2026-08-28T12:00:00Z',
      updated_at: '2026-08-28T12:00:00Z',
      previous_value: { phone_number: '5551234', address: 'Calle 1' },
      new_value: { phone_number: '5559999', address: 'Calle 1' },
    };
    const changes = service.getChangedFields(auditEdit);
    expect(changes).toEqual([
      {
        field: 'phone_number',
        label: 'Teléfono',
        oldValue: '5551234',
        newValue: '5559999',
      },
    ]);
  });
});
