import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../core/api/api.config';
export interface PointsView {
  account: { balance: number; reserved: number };
  available: number;
  estimated_value: string | null;
  period: { id: string; name: string; ends_at: string; point_value: string } | null;
  movements: Array<{
    id: string;
    type: string;
    generated: number;
    discounted: number;
    redeemed: number;
    balance_after: number;
    occurred_at: string;
  }>;
}
export interface Redemption {
  id: string;
  points: number;
  monetary_value: string;
  status: string;
}
@Injectable({ providedIn: 'root' })
export class PuntosApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  account(): Observable<PointsView> {
    return this.http
      .get<{ data: PointsView }>(`${this.config.baseUrl}/me/points`)
      .pipe(map((r) => r.data));
  }
  request(points: number): Observable<Redemption> {
    return this.post(`${this.config.baseUrl}/point-redemption-requests`, { points });
  }
  requests(): Observable<Redemption[]> {
    return this.http
      .get<{ data: Redemption[] }>(`${this.config.baseUrl}/point-redemption-requests`)
      .pipe(map((r) => r.data));
  }
  decide(id: string, decision: 'AUTHORIZE' | 'REJECT', reason: string): Observable<Redemption> {
    return this.post(`${this.config.baseUrl}/point-redemption-requests/${id}/decision`, {
      decision,
      reason,
    });
  }
  deliver(id: string, reference: string): Observable<Redemption> {
    return this.post(`${this.config.baseUrl}/point-redemption-requests/${id}/deliver`, {
      reference,
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
