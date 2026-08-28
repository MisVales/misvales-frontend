import '@angular/compiler';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG, defaultApiConfig } from '@core/api/api.config';
import { DashboardDataService } from './dashboard-data.service';

describe('DashboardDataService para Cajera', () => {
  let service: DashboardDataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardDataService, { provide: API_CONFIG, useValue: defaultApiConfig }],
    });
    service = TestBed.inject(DashboardDataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('no consulta periodos inexistentes ni bandejas de autorización gerencial', () => {
    let loaded = false;
    service.load('cashier').subscribe(() => (loaded = true));

    expect(http.match((request) => request.url.endsWith('/bank-simulations'))).toHaveLength(0);
    expect(
      http.match((request) => request.url.endsWith('/voucher-modification-requests')),
    ).toHaveLength(0);

    http
      .expectOne((request) => request.url.endsWith('/dashboard/operations'))
      .flush({
        data: {
          scope: 'PERSONAL',
          generated_at: '2026-08-24T12:00:00-06:00',
          vouchers: { cashed_today: 0, amount_today: '0', pending: 0 },
          payments: { registered_today: 0, amount_today: '0' },
          reconciliation: {
            pending: 0,
            manual_pending: 0,
            reconciled_today: 0,
            reconciled_amount_today: '0',
            surplus_today: 0,
            surplus_amount_today: '0',
          },
          clarifications: { pending: 0, authorized_refunds: 0 },
        },
      });
    const voucherRequests = http.match((request) => request.url.endsWith('/cashier/vouchers'));
    expect(voucherRequests).toHaveLength(1);
    voucherRequests[0].flush({ data: [] });
    http.expectOne((request) => request.url.endsWith('/bank-movements')).flush({ data: [] });
    http
      .expectOne((request) => request.url.endsWith('/payment-clarifications'))
      .flush({ data: [] });
    http
      .expectOne((request) => request.url.endsWith('/manual-reconciliation-requests'))
      .flush({ data: [] });
    http.expectOne((request) => request.url.endsWith('/refund-requests')).flush({ data: [] });

    expect(loaded).toBe(true);
  });

  it('presenta cartera y resumen del periodo en el inicio móvil de distribuidora', () => {
    let result: import('./dashboard.models').DashboardData | undefined;
    service.load('distributor').subscribe((value) => (result = value));

    http.expectOne((request) => request.url.endsWith('/me/credit-line')).flush({ data: {
      id: 'line-1', distributor: { id: 'd1', distributor_number: 'D-1', full_name: 'Ana' },
      total_authorized: '20000.0000', used_balance: '5000.0000', available_balance: '15000.0000',
      current_debt: '0.0000', restriction: null, lock_version: 1,
    } });
    http.expectOne((request) => request.url.endsWith('/vouchers')).flush({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } });
    http.expectOne((request) => request.url.endsWith('/relations')).flush({ data: { data: [], current_page: 1, last_page: 1, total: 0 } });
    http.expectOne((request) => request.url.endsWith('/points/balance')).flush({ data: { balance: 25, reserved: 0, available_points: 25, money_equivalent: '25.0000', total_money_equivalent: '25.0000' } });
    http.expectOne((request) => request.url.endsWith('/dashboard/distributor-summary')).flush({ data: {
      period_start: '2026-08-01', period_end: '2026-08-31',
      portfolio: { total_to_collect: '2500.0000', clients_with_balance: 2, overdue_entries: 1 },
      period: { distributor_profit: '500.0000', paid_to_misvales: '1200.0000', capital_recovered: '900.0000' },
    } });

    expect(result?.sections.find((section) => section.id === 'client-portfolio')?.summary?.[0].label).toBe('Total por cobrar a clientes');
    expect(result?.sections.find((section) => section.id === 'period-summary')?.summary?.map((item) => item.label)).toContain('Capital recuperado');
  });
});
