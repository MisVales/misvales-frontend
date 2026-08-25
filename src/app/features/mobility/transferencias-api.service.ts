import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../core/api/api.config';

export interface ClientTransfer {
  id: string;
  client_id: string;
  origin_distributor_id: string;
  destination_distributor_id: string;
  origin_branch_id: string;
  destination_branch_id: string;
  status: string;
  initiated_by: string;
  preaccepted_by: string | null;
  origin_decided_by: string | null;
  completed_by: string | null;
  origin_decision_reason: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizationalChange {
  id: string;
  type: string;
  subject_id?: string;
  reason: string;
  occurred_at: string;
}

@Injectable({ providedIn: 'root' })
export class TransferenciasApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  transfers(): Observable<ClientTransfer[]> {
    return this.http
      .get<{ data: { data: ClientTransfer[] } }>(`${this.config.baseUrl}/client-transfers`)
      .pipe(map((response) => response.data.data));
  }

  originDecision(transfer: string, authorize: boolean, reason: string): Observable<ClientTransfer> {
    return this.post(`${this.config.baseUrl}/client-transfers/${transfer}/origin-decision`, {
      authorize,
      reason,
    });
  }

  history(): Observable<OrganizationalChange[]> {
    return this.http
      .get<{ data: { data: OrganizationalChange[] } }>(
        `${this.config.baseUrl}/organizational-change-history`,
      )
      .pipe(map((response) => response.data.data));
  }

  private post<T>(url: string, body: object): Observable<T> {
    return this.http
      .post<{ data: T }>(url, body, {
        headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }),
      })
      .pipe(map((response) => response.data));
  }
}
