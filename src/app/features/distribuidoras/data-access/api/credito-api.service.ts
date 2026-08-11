import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { API_CONFIG } from '../../../../core/api/api.config';

export interface CreditLineView {
  id: string;
  distributor: { id: string; distributor_number: string; full_name: string };
  total_authorized: string;
  used_balance: string;
  available_balance: string;
  restriction: unknown | null;
  lock_version: number;
}

export interface CreditIncreaseView {
  id: string;
  request_number: string;
  status: string;
  distributor?: { id: string; distributor_number: string; full_name: string };
  branch?: { id: string; name: string };
  requested_amount: string | null;
  recommended_amount: string | null;
  authorized_amount: string | null;
  requested_at: string | null;
  capabilities?: { can_preauthorize: boolean; can_reject_by_coordinator: boolean; can_decide: boolean };
}

@Injectable({ providedIn: 'root' })
export class CreditoApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  listarLineas(): Observable<CreditLineView[]> {
    return this.http.get<{ data: Array<{ id: string }> }>(`${this.config.baseUrl}/distributors`, {
      params: new HttpParams().set('per_page', '100'),
    }).pipe(
      switchMap((response) => {
        const requests = response.data.map((distributor) =>
          this.http.get<{ data?: CreditLineView } | CreditLineView>(`${this.config.baseUrl}/distributors/${distributor.id}/credit-line`).pipe(
            map((line) => 'data' in line && line.data ? line.data : line as CreditLineView),
            catchError(() => of(null)),
          ),
        );
        return requests.length ? forkJoin(requests) : of([]);
      }),
      map((lines) => lines.filter((line): line is CreditLineView => line !== null)),
    );
  }

  listarIncrementos(page = 1): Observable<{ data: CreditIncreaseView[]; meta: { current_page: number; last_page: number; total: number } }> {
    return this.http.get<{ data: CreditIncreaseView[]; meta: { current_page: number; last_page: number; total: number } }>(
      `${this.config.baseUrl}/credit-increase-requests`,
      { params: new HttpParams().set('page', page.toString()).set('per_page', '15') },
    );
  }
}
