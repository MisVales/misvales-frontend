import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';

export interface RelationItem {
  id: string;
  snapshot: Record<string, string | number>;
  portfolio_amount: string;
  misvales_amount: string;
}
export interface RelationView {
  id: string;
  payment_reference: string;
  cutoff_at: string;
  payment_deadline_at: string;
  advance_period_start: string;
  advance_period_end: string;
  financial_status: string;
  review_status: string;
  portfolio_total: string;
  misvales_total: string;
  reconciled_total: string;
  surcharge_total: string;
  balance: string;
  header_snapshot: {
    number?: string | null;
    name?: string | null;
    address?: string | null;
    branch?: string | null;
    coordinator?: string | null;
    credit_line_total?: string | number | null;
    credit_available?: string | number | null;
    points?: string | number | null;
    configuration_versions?: Record<string, string>;
  };
  bank_snapshot: {
    name?: string | null;
    beneficiary?: string | null;
    agreement?: string | null;
    clabe?: string | null;
  };
  partidas?: RelationItem[];
  settled_at?: string;
  temporal_classification?: string;
  pagos?: Array<{
    id: string;
    amount: string;
    applied_at: string;
    surcharge_applied: string;
    interest_applied: string;
    insurance_applied: string;
    commission_applied: string;
    capital_applied: string;
    line_recovered: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class RelacionesApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  list(): Observable<RelationView[]> {
    return this.http
      .get<{ data: { data: RelationView[] } }>(`${this.config.baseUrl}/relations`)
      .pipe(map((r) => r.data.data));
  }
  detail(id: string): Observable<RelationView> {
    return this.http
      .get<{ data: RelationView }>(`${this.config.baseUrl}/relations/${id}`)
      .pipe(map((r) => r.data));
  }
  download(id: string): Observable<Blob> {
    return this.http.get(`${this.config.baseUrl}/relations/${id}/download`, {
      responseType: 'blob',
    });
  }
}
