import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';
export interface Surplus {
  id: string;
  original_amount: string;
  available_amount: string;
  reserved_amount: string;
  status: string;
  created_at: string;
}
export interface RefundRequest {
  id: string;
  surplus_id: string;
  amount: string;
  status: string;
  branch_id: string;
  decision_reason?: string;
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
  execute(
    id: string,
    method: string,
    reference: string,
    evidence_media_id: string,
  ): Observable<RefundRequest> {
    return this.post(`${this.config.baseUrl}/refund-requests/${id}/execute`, {
      method,
      reference,
      evidence_media_id,
    });
  }
  private post<T>(url: string, body: object): Observable<T> {
    return this.http
      .post<{ data: T }>(url, body, {
        headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }),
      })
      .pipe(map((r) => r.data));
  }
}
