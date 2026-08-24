import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';
export interface Surplus {
  id: string;
  distributor_id: string;
  distributor_name?: string;
  branch_id: string;
  branch_name?: string;
  origin_relation_id: string;
  origin_relation_reference?: string;
  bank_movement_id: string;
  bank_folio?: string;
  original_amount: string;
  available_amount: string;
  reserved_amount: string;
  status: string;
  applications: SurplusApplication[];
  refund_requests: RefundRequest[];
  created_at: string;
}
export interface SurplusApplication {
  id: string;
  relation_id: string;
  relation_reference?: string;
  payment_id?: string | null;
  amount: string;
  balance_before?: string | null;
  balance_after?: string | null;
  process: string;
  applied_at: string;
}
export interface RefundRequest {
  id: string;
  surplus_id: string;
  amount: string;
  status: string;
  branch_id: string;
  branch_name?: string;
  distributor_id?: string;
  distributor_name?: string;
  origin_relation_id?: string;
  origin_relation_reference?: string;
  bank_movement_id?: string;
  bank_folio?: string;
  requested_by?: string;
  requester_name?: string;
  decided_by?: string;
  decision_maker_name?: string;
  decision_reason?: string;
  authorized_at?: string;
  execution_method?: string;
  execution_reference?: string;
  execution_amount?: string;
  execution_observations?: string;
  evidence_media_id?: string;
  executed_at?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  created_at: string;
  destination_bank_account?: {
    bank_name: string;
    account_holder_name: string;
    clabe: string;
  };
}
@Injectable({ providedIn: 'root' })
export class ExcedentesApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  list(): Observable<Surplus[]> {
    return this.http
      .get<{ data: Surplus[] }>(`${this.config.baseUrl}/surpluses`)
      .pipe(map((r) => r.data));
  }
  get(id: string): Observable<Surplus> {
    return this.http
      .get<{ data: Surplus }>(`${this.config.baseUrl}/surpluses/${id}`)
      .pipe(map((r) => r.data));
  }
  credit(id: string): Observable<Surplus> {
    return this.post(`${this.config.baseUrl}/surpluses/${id}/credit-balance`, {});
  }
  refund(id: string): Observable<RefundRequest> {
    return this.post(`${this.config.baseUrl}/surpluses/${id}/refund-requests`, {});
  }
  refunds(): Observable<RefundRequest[]> {
    return this.http
      .get<{ data: RefundRequest[] }>(`${this.config.baseUrl}/refund-requests`)
      .pipe(map((r) => r.data));
  }
  decide(id: string, decision: 'AUTHORIZE' | 'REJECT', reason: string): Observable<RefundRequest> {
    return this.post(`${this.config.baseUrl}/refund-requests/${id}/decision`, { decision, reason });
  }
  cancel(id: string, reason: string): Observable<RefundRequest> {
    return this.post(`${this.config.baseUrl}/refund-requests/${id}/cancel`, { reason });
  }
  execute(
    id: string,
    payload: {
      amount: string;
      executed_at: string;
      method: string;
      reference: string;
      evidence_media_id: string;
      observations?: string;
    },
  ): Observable<RefundRequest> {
    return this.post(`${this.config.baseUrl}/refund-requests/${id}/execute`, payload);
  }
  private post<T>(url: string, body: object): Observable<T> {
    return this.http
      .post<{ data: T }>(url, body, {
        headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }),
      })
      .pipe(map((r) => r.data));
  }
}
