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
});
