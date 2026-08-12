import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../core/api/api.config';

export interface RiskAlert {
  id: string;
  distributor_id: string;
  branch_id: string;
  status: string;
  consecutive_defaults: number;
  relation_ids: string[];
  overdue_balance: string;
}

export interface Removal {
  id: string;
  distributor_id: string;
  status: string;
  reason: string;
}

export interface DelinquencyStatus {
  blocked: boolean;
  reason: string | null;
  can_pay: true;
  can_clarify: true;
}

@Injectable({ providedIn: 'root' })
export class RiesgoApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  alerts(): Observable<RiskAlert[]> {
    return this.http
      .get<{ data: RiskAlert[] }>(`${this.config.baseUrl}/risk-alerts`)
      .pipe(map((response) => response.data));
  }

  me(): Observable<DelinquencyStatus> {
    return this.http
      .get<{ data: DelinquencyStatus }>(`${this.config.baseUrl}/me/delinquency-status`)
      .pipe(map((response) => response.data));
  }

  decide(id: string, decision: 'APPLY' | 'DO_NOT_APPLY', reason: string): Observable<RiskAlert> {
    return this.post(`${this.config.baseUrl}/risk-alerts/${id}/decision`, { decision, reason });
  }

  requestRemoval(distributor: string, reason: string): Observable<Removal> {
    return this.post(
      `${this.config.baseUrl}/distributors/${distributor}/delinquency-removal-requests`,
      { reason },
    );
  }

  removals(): Observable<Removal[]> {
    return this.http
      .get<{ data: Removal[] }>(`${this.config.baseUrl}/delinquency-removal-requests`)
      .pipe(map((response) => response.data));
  }

  decideRemoval(id: string, decision: 'AUTHORIZE' | 'REJECT', reason: string): Observable<Removal> {
    return this.post(`${this.config.baseUrl}/delinquency-removal-requests/${id}/decision`, {
      decision,
      reason,
    });
  }

  private post<T>(url: string, body: object): Observable<T> {
    return this.http
      .post<{ data: T }>(url, body, {
        headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }),
      })
      .pipe(map((response) => response.data));
  }
}
