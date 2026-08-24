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
});
