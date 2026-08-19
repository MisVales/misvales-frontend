import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../core/api/api.config';

export interface OrganizationalChange {
  id: string;
  type: string;
  reason: string;
  occurred_at: string;
}

@Injectable({ providedIn: 'root' })
export class TransferenciasApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  history(): Observable<OrganizationalChange[]> {
    return this.http.get<{ data: { data: OrganizationalChange[] } }>(`${this.config.baseUrl}/organizational-change-history`)
      .pipe(map((response) => response.data.data));
  }

  changeCoordinator(distributor: string, destinationCoordinator: string, reason: string): Observable<unknown> {
    return this.http.post<{ data: unknown }>(
      `${this.config.baseUrl}/distributors/${distributor}/coordinator-change`,
      { destination_coordinator_id: destinationCoordinator, reason },
      { headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }) },
    ).pipe(map((response) => response.data));
  }
}
