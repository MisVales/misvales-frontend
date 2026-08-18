import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
}

export interface OrganizationalChange {
  id: string;
  type: string;
  subject_id: string;
  reason: string;
  before_snapshot: Record<string, unknown>;
  after_snapshot: Record<string, unknown>;
  occurred_at: string;
}

export interface TransferDestination {
  id: string;
  distributor_number: string;
  full_name: string | null;
  branch: { id: string; name: string } | null;
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

  destinations(search = ''): Observable<TransferDestination[]> {
    const params = search.trim() ? new HttpParams().set('search', search.trim()) : new HttpParams();
    return this.http
      .get<{ data: TransferDestination[] }>(`${this.config.baseUrl}/client-transfer-destinations`, {
        params,
      })
      .pipe(map((response) => response.data));
  }

  history(): Observable<OrganizationalChange[]> {
    return this.http
      .get<{ data: { data: OrganizationalChange[] } }>(
        `${this.config.baseUrl}/organizational-change-history`,
      )
      .pipe(map((response) => response.data.data));
  }

  initiate(client: string, destination: string): Observable<ClientTransfer> {
    return this.post(`${this.config.baseUrl}/clients/${client}/transfers`, {
      destination_distributor_id: destination,
    });
  }

  preaccept(transfer: string, accept: boolean): Observable<ClientTransfer> {
    return this.post(`${this.config.baseUrl}/client-transfers/${transfer}/preaccept`, { accept });
  }

  originDecision(transfer: string, authorize: boolean, reason: string): Observable<ClientTransfer> {
    return this.post(`${this.config.baseUrl}/client-transfers/${transfer}/origin-decision`, {
      authorize,
      reason,
    });
  }

  complete(transfer: string): Observable<ClientTransfer> {
    return this.post(`${this.config.baseUrl}/client-transfers/${transfer}/complete`, {});
  }

  cancel(transfer: string, reason: string): Observable<ClientTransfer> {
    return this.post(`${this.config.baseUrl}/client-transfers/${transfer}/cancel`, { reason });
  }

  reassignClient(client: string, destination: string, reason: string): Observable<unknown> {
    return this.post(`${this.config.baseUrl}/clients/${client}/administrative-reassignment`, {
      destination_distributor_id: destination,
      reason,
    });
  }

  changeBranch(
    distributor: string,
    destinationBranch: string,
    destinationCoordinator: string,
    reason: string,
  ): Observable<unknown> {
    return this.post(`${this.config.baseUrl}/distributors/${distributor}/branch-change`, {
      destination_branch_id: destinationBranch,
      destination_coordinator_id: destinationCoordinator,
      reason,
    });
  }

  changeCoordinator(
    distributor: string,
    destinationCoordinator: string,
    reason: string,
  ): Observable<unknown> {
    return this.post(`${this.config.baseUrl}/distributors/${distributor}/coordinator-change`, {
      destination_coordinator_id: destinationCoordinator,
      reason,
    });
  }

  coordinatorExit(
    coordinator: string,
    assignments: { distributor_id: string; destination_coordinator_id: string }[],
    reason: string,
  ): Observable<unknown> {
    return this.post(`${this.config.baseUrl}/coordinators/${coordinator}/exit-reassignment`, {
      assignments,
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
