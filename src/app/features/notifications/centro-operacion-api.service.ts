import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../core/api/api.config';
import type { Page } from '@shared/types/pagination.types';

export interface NotificationItem {
  id: string;
  data: { title: string; description: string; event_type: string; deep_link: string };
  read_at: string | null;
  created_at: string;
}
export interface ReadinessStatus {
  status: 'ready' | 'not_ready';
  checks: Record<string, boolean>;
  failed_jobs: number;
  queued_jobs: number | null;
  checked_at: string;
}
export interface CurrentCutoffSummary {
  has_open_cutoff: boolean;
  period: { start: string | null; projected_end: string };
  projected_status: string;
  summary: { distributors: number; operations: number; total: number };
  payment_period: PaymentPeriodSummary | null;
}
export interface ForceCutoffResponse {
  success: boolean;
  process_run_id: string;
  projected_status: string;
  simulated_cutoff_at: string;
  payment_deadline_at: string;
  relations_generated: number;
}
export interface PaymentPeriodSummary {
  process_run_id: string;
  cutoff_at: string;
  payment_deadline_at: string;
  relations: number;
  summary: { distributors: number; operations: number; total: number };
  status: 'OPEN' | 'DEADLINE_REACHED' | 'EXPIRED' | 'COMPLETED';
  evaluated_at: string | null;
  overdue_evaluation_at: string | null;
  outcomes: PaymentDeadlineOutcomes | null;
}
export interface PaymentDeadlineOutcomes {
  settled: number;
  partially_paid: number;
  unpaid: number;
}
export interface ForcePaymentDeadlineResponse {
  success: boolean;
  replayed: boolean;
  status: 'DEADLINE_REACHED' | 'DEFERRED' | 'COMPLETED';
  process_run_id: string;
  evaluated_at: string;
  message?: string;
  overdue_evaluation_at?: string;
  missing_bank_file_branches?: string[];
  relations_evaluated?: number;
  outcomes?: PaymentDeadlineOutcomes;
  late_fees?: { applied: number; deferred: number };
  open_reviews?: number;
  risk_alerts?: number;
  notifications?: number;
}
export interface OperationalLog {
  id: string;
  channel: 'APPLICATION' | 'SECURITY' | 'OPERATION' | 'ERROR' | 'AUDIT' | string;
  level: string;
  event: string;
  request_id: string | null;
  correlation_id: string | null;
  trace_id: string | null;
  method: string | null;
  path: string | null;
  status_code: number | null;
  duration_ms: number | null;
  context: Record<string, unknown> | null;
  occurred_at: string;
}

@Injectable({ providedIn: 'root' })
export class CentroOperacionApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  readiness(): Observable<ReadinessStatus> {
    return this.http.get<ReadinessStatus>(`${this.config.baseUrl}/health/readiness`);
  }

  notifications(unread = false): Observable<Page<NotificationItem>> {
    return this.http
      .get<{ data: Page<NotificationItem> }>(`${this.config.baseUrl}/notifications`, {
        params: { unread },
      })
      .pipe(map((response) => response.data));
  }
  unreadCount(): Observable<number> {
    return this.http
      .get<{ data: { count: number } }>(`${this.config.baseUrl}/notifications/unread-count`)
      .pipe(map((response) => response.data.count));
  }
  markRead(id: string): Observable<NotificationItem> {
    return this.http
      .patch<{ data: NotificationItem }>(`${this.config.baseUrl}/notifications/${id}/read`, {})
      .pipe(map((response) => response.data));
  }
  audits(filters: Record<string, string>): Observable<Page<Record<string, unknown>>> {
    return this.http
      .get<{ data: Page<Record<string, unknown>> }>(`${this.config.baseUrl}/audit-logs`, {
        params: filters,
      })
      .pipe(map((response) => response.data));
  }
  logs(filters: Record<string, string>): Observable<Page<OperationalLog>> {
    return this.http
      .get<{ data: Page<OperationalLog> }>(`${this.config.baseUrl}/operational-logs`, {
        params: filters,
      })
      .pipe(map((response) => response.data));
  }

  getCurrentCutoffSummary(): Observable<CurrentCutoffSummary> {
    return this.http
      .get<{ data: CurrentCutoffSummary }>(`${this.config.baseUrl}/operations/current-cutoff`)
      .pipe(map((response) => response.data));
  }

  forceCutoff(motivo: string, idempotencyKey: string): Observable<ForceCutoffResponse> {
    return this.http
      .post<{ data: ForceCutoffResponse }>(
        `${this.config.baseUrl}/operations/force-cutoff`, 
        { motivo }, 
        { headers: { 'Idempotency-Key': idempotencyKey } }
      )
      .pipe(map((response) => response.data));
  }

  forcePaymentDeadline(motivo: string, idempotencyKey: string): Observable<ForcePaymentDeadlineResponse> {
    return this.http
      .post<{ data: ForcePaymentDeadlineResponse }>(
        `${this.config.baseUrl}/operations/force-payment-deadline`,
        { motivo },
        { headers: { 'Idempotency-Key': idempotencyKey } },
      )
      .pipe(map((response) => response.data));
  }
}
