import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '@core/api/api.config';
import { ReportsApiService } from './reports-api.service';

describe('ReportsApiService', () => {
  let service: ReportsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportsApiService, { provide: API_CONFIG, useValue: defaultApiConfig }],
    });
    service = TestBed.inject(ReportsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('consulta reportes paginados con filtros sin cargar el universo', () => {
    service
      .run('credit-lines', { status: 'ACTIVE' })
      .subscribe((page) => expect(page.total).toBe(1));
    const request = http.expectOne((item) => item.url.endsWith('/reports/credit-lines'));
    expect(request.request.params.get('status')).toBe('ACTIVE');
    request.flush({ data: { data: [{ id: '1' }], current_page: 1, last_page: 1, total: 1 } });
  });

  it('consulta el resumen de Inicio sin enviar identificadores de alcance', () => {
    service.home().subscribe((summary) => expect(summary.points.available_points).toBe(248900));

    const request = http.expectOne((item) => item.url.endsWith('/reports/home'));
    expect(request.request.params.keys()).toEqual([]);
    request.flush({
      data: {
        generated_at: '2026-08-23T12:00:00-06:00',
        delinquency: { total: 0, overdue_balance: '0', rows: [] },
        cutoffs: { total_balance: '0', active_count: 0, rows: [] },
        points: { available_points: 248900, distributors: 186, trend: [] },
        applications: { total: 0, pending: 0, validated: 0, rows: [] },
      },
    });
  });
});
