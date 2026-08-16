import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { API_CONFIG } from '../../../../core/api/api.config';

export interface CreditLineView {
  id: string;
  distributor: { id: string; distributor_number: string; full_name: string };
  total_authorized: string;
  used_balance: string;
  available_balance: string;
  restriction: { has_admissible_range: boolean; reference_amount: string; lower_limit: string; upper_limit: string } | null;
  capabilities?: { can_request_increase: boolean; can_review_increase: boolean; can_decide_increase: boolean; can_view_movements: boolean };
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
  request_reason?: string | null;
  coordinator_reason?: string | null;
  manager_reason?: string | null;
  line_total_at_request?: string | null;
  used_balance_at_request?: string | null;
  available_balance_at_request?: string | null;
  current_credit_line?: { id: string; total_authorized: string; used_balance: string; available_balance: string };
  lock_version: number;
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

  consultarMiLinea(): Observable<CreditLineView> {
    return this.http.get<{ data: CreditLineView }>(`${this.config.baseUrl}/me/credit-line`).pipe(map(response => response.data));
  }

  listarIncrementos(page = 1): Observable<{ data: CreditIncreaseView[]; meta: { current_page: number; last_page: number; total: number } }> {
    return this.http.get<{ data: CreditIncreaseView[]; meta: { current_page: number; last_page: number; total: number } }>(
      `${this.config.baseUrl}/credit-increase-requests`,
      { params: new HttpParams().set('page', page.toString()).set('per_page', '15') },
    );
  }

  consultarIncremento(id: string): Observable<CreditIncreaseView> {
    return this.http.get<{ data: CreditIncreaseView }>(`${this.config.baseUrl}/credit-increase-requests/${id}`).pipe(map(response => response.data));
  }

  solicitarIncremento(distributorId: string, requestedAmount: string, requestReason: string, lockVersion: number): Observable<CreditIncreaseView> {
    return this.http.post<{ data: CreditIncreaseView }>(`${this.config.baseUrl}/distributors/${distributorId}/credit-increase-requests`,
      { requested_amount: requestedAmount, request_reason: requestReason, lock_version: lockVersion },
      { headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }) },
    ).pipe(map(response => response.data));
  }

  revisarIncremento(id: string, recommendedAmount: string, reason: string, lockVersion: number): Observable<CreditIncreaseView> {
    return this.http.post<{ data: CreditIncreaseView }>(`${this.config.baseUrl}/credit-increase-requests/${id}/preauthorize`,
      { recommended_amount: recommendedAmount, reason, lock_version: lockVersion }).pipe(map(response => response.data));
  }

  rechazarCoordinador(id: string, reason: string, lockVersion: number): Observable<CreditIncreaseView> {
    return this.http.post<{ data: CreditIncreaseView }>(`${this.config.baseUrl}/credit-increase-requests/${id}/reject-by-coordinator`,
      { reason, lock_version: lockVersion }).pipe(map(response => response.data));
  }

  decidir(id: string, decision: 'APPROVE_REQUESTED' | 'APPROVE_LOWER' | 'REJECT', reason: string, lockVersion: number, authorizedAmount?: string): Observable<CreditIncreaseView> {
    const body: Record<string, string | number> = { decision, reason, lock_version: lockVersion };
    if (decision === 'APPROVE_LOWER' && authorizedAmount) body['authorized_amount'] = authorizedAmount;
    return this.http.post<{ data: CreditIncreaseView }>(
      `${this.config.baseUrl}/credit-increase-requests/${id}/manager-decision`,
      body,
      { headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }) },
    )
      .pipe(map(response => response.data));
  }
}
