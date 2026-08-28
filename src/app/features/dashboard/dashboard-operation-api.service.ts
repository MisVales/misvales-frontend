import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';

export interface OperationDashboardSummary {
  scope: 'PERSONAL' | 'BRANCH' | 'GLOBAL';
  generated_at: string;
  vouchers: { cashed_today: number; amount_today: string; pending: number };
  payments: { registered_today: number; amount_today: string };
  reconciliation: {
    pending: number;
    manual_pending: number;
    reconciled_today: number;
    reconciled_amount_today: string;
    surplus_today: number;
    surplus_amount_today: string;
  };
  clarifications: { pending: number; authorized_refunds: number };
}

export interface DistributorDashboardSummary {
  period_start: string;
  period_end: string;
  portfolio: { total_to_collect: string; clients_with_balance: number; overdue_entries: number };
  period: { distributor_profit: string; paid_to_misvales: string; capital_recovered: string };
}

@Injectable({ providedIn: 'root' })
export class DashboardOperationApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  summary(): Observable<OperationDashboardSummary> {
    return this.http
      .get<{ data: OperationDashboardSummary }>(`${this.config.baseUrl}/dashboard/operations`)
      .pipe(map((response) => response.data));
  }

  distributorSummary(): Observable<DistributorDashboardSummary> {
    return this.http
      .get<{ data: DistributorDashboardSummary }>(`${this.config.baseUrl}/dashboard/distributor-summary`)
      .pipe(map((response) => response.data));
  }
}
