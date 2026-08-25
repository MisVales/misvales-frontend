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

@Injectable({ providedIn: 'root' })
export class DashboardOperationApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  summary(): Observable<OperationDashboardSummary> {
    return this.http
      .get<{ data: OperationDashboardSummary }>(`${this.config.baseUrl}/dashboard/operations`)
      .pipe(map((response) => response.data));
  }
}
