import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';
import { SKIP_GLOBAL_ALERT } from '../../../core/interceptors/error-handling.interceptor';

export interface BankImport {
  id: string;
  original_name: string | null;
  status: string;
  row_count: number;
  summary?: Record<string, number>;
  error_code?: string | null;
  replayed: boolean;
  processed_at: string | null;
  created_at: string;
}

export interface PendingReconciliationPeriod {
  process_run_id: string;
  reconciliation_number: number;
  cutoff_at: string;
  payment_deadline_at: string | null;
  relations: number;
  distributors: number;
  pending_total: string;
  status: 'PENDING_RECONCILIATION';
}

export interface ManualRequestSummary {
  id: string;
  status: string;
}

export interface BankMovement {
  id: string;
  row_number: number;
  payment_reference: string;
  amount: string;
  paid_at: string;
  bank_folio: string;
  concept: string;
  classification: string;
  result: string;
  reconciliation_status: string;
  balance_before: string | null;
  applied_amount: string;
  surplus_amount: string;
  relation_id: string | null;
  relation_reference: string | null;
  distributor_id: string | null;
  distributor_number: string | null;
  distributor_name: string | null;
  manual_request?: ManualRequestSummary | null;
}

export interface PaymentClarification {
  id: string;
  folio: string;
  distributor_id: string;
  distributor_number: string | null;
  distributor_name: string | null;
  relation_id: string;
  relation_reference: string;
  relation_balance: string | null;
  evidence_media_id: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface ManualReconciliationRequest {
  id: string;
  bank_movement_id: string;
  bank_folio: string;
  amount: string | null;
  relation_id: string;
  relation_reference: string;
  distributor_name: string | null;
  clarification_id: string;
  reason: string;
  status: string;
  requested_by: string;
  requested_by_name: string | null;
  authorized_by: string | null;
  authorized_by_name: string | null;
  decision_reason: string | null;
  executed_by: string | null;
  executed_by_name: string | null;
  authorized_at: string | null;
  executed_at: string | null;
  created_at: string;
}

export interface MovementFilters {
  result?: string;
  status?: string;
  search?: string;
}

export interface ReconciliationRequestOptions {
  skipGlobalAlert?: boolean;
}

export interface SimulatedBankTransfer {
  id: string;
  relation_id: string;
  target_voucher_id?: string | null;
  concept: string;
  payment_reference: string;
  amount: string;
  bank_folio: string;
  paid_at: string;
  payment_type: 'TRANSFER' | 'ONLINE_BANKING' | 'COUNTER' | 'CREDIT_BALANCE';
  created_at: string;
}

export interface SimulatedBankTransferPayload {
  relation_id: string;
  target_voucher_id?: string;
  amount: number;
  payment_type: SimulatedBankTransfer['payment_type'];
  concept?: string;
  paid_at?: string;
}

@Injectable({ providedIn: 'root' })
export class ConciliacionApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  upload(file: File, processRunId?: string): Observable<BankImport> {
    const data = new FormData();
    data.append('file', file);
    if (processRunId) data.append('process_run_id', processRunId);
    return this.http
      .post<{ data: BankImport }>(`${this.config.baseUrl}/bank-imports`, data)
      .pipe(map((response) => response.data));
  }

  imports(options: ReconciliationRequestOptions = {}): Observable<BankImport[]> {
    return this.http
      .get<{ data: BankImport[] }>(`${this.config.baseUrl}/bank-imports`, {
        context: this.requestContext(options),
      })
      .pipe(map((response) => response.data));
  }

  simulateTransfer(payload: SimulatedBankTransferPayload): Observable<SimulatedBankTransfer> {
    return this.http
      .post<{ data: SimulatedBankTransfer }>(`${this.config.baseUrl}/bank-simulations`, payload)
      .pipe(map((response) => response.data));
  }

  simulatedTransfers(
    processRunId?: string,
    options: ReconciliationRequestOptions = {},
  ): Observable<SimulatedBankTransfer[]> {
    let params = new HttpParams();
    if (processRunId) params = params.set('process_run_id', processRunId);
    return this.http
      .get<{ data: SimulatedBankTransfer[] }>(`${this.config.baseUrl}/bank-simulations`, {
        params,
        context: this.requestContext(options),
      })
      .pipe(map((response) => response.data));
  }

  exportSimulatedTransfers(processRunId?: string): Observable<Blob> {
    let params = new HttpParams();
    if (processRunId) params = params.set('process_run_id', processRunId);
    return this.http.get(`${this.config.baseUrl}/bank-simulations/export`, {
      responseType: 'blob',
      params,
    });
  }

  simulationTicket(transferId: string): Observable<Blob> {
    return this.http.get(`${this.config.baseUrl}/bank-simulations/${transferId}/ticket`, {
      responseType: 'blob',
    });
  }

  movements(filters: MovementFilters = {}): Observable<BankMovement[]> {
    let params = new HttpParams().set('per_page', '100');
    if (filters.result) params = params.set('result', filters.result);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.search) params = params.set('search', filters.search);
    return this.http
      .get<{ data: BankMovement[] }>(`${this.config.baseUrl}/bank-movements`, { params })
      .pipe(map((response) => response.data));
  }

  clarifications(): Observable<PaymentClarification[]> {
    return this.http
      .get<{ data: PaymentClarification[] }>(`${this.config.baseUrl}/payment-clarifications`, {
        params: { per_page: '100' },
      })
      .pipe(map((response) => response.data));
  }

  manualRequests(): Observable<ManualReconciliationRequest[]> {
    return this.http
      .get<{ data: ManualReconciliationRequest[] }>(
        `${this.config.baseUrl}/manual-reconciliation-requests`,
        { params: { per_page: '100' } },
      )
      .pipe(map((response) => response.data));
  }

  createClarification(
    relationId: string,
    evidenceMediaId: string,
    reason: string,
  ): Observable<PaymentClarification> {
    return this.http
      .post<{ data: PaymentClarification }>(
        `${this.config.baseUrl}/relations/${relationId}/clarifications`,
        {
          evidence_media_id: evidenceMediaId,
          reason,
        },
      )
      .pipe(map((response) => response.data));
  }

  requestManual(
    movementId: string,
    relationId: string,
    clarificationId: string,
    reason: string,
  ): Observable<ManualReconciliationRequest> {
    return this.http
      .post<{ data: ManualReconciliationRequest }>(
        `${this.config.baseUrl}/bank-movements/${movementId}/manual-reconciliation-requests`,
        {
          relation_id: relationId,
          clarification_id: clarificationId,
          reason,
        },
      )
      .pipe(map((response) => response.data));
  }

  decideManual(
    requestId: string,
    decision: 'AUTHORIZE' | 'REJECT',
    reason?: string,
  ): Observable<ManualReconciliationRequest> {
    return this.http
      .post<{ data: ManualReconciliationRequest }>(
        `${this.config.baseUrl}/manual-reconciliation-requests/${requestId}/decision`,
        {
          decision,
          reason: reason || undefined,
        },
      )
      .pipe(map((response) => response.data));
  }

  executeManual(requestId: string): Observable<ManualReconciliationRequest> {
    return this.http
      .post<{ data: ManualReconciliationRequest }>(
        `${this.config.baseUrl}/manual-reconciliation-requests/${requestId}/execute`,
        {},
      )
      .pipe(map((response) => response.data));
  }

  pendingPeriods(
    options: ReconciliationRequestOptions = {},
  ): Observable<PendingReconciliationPeriod[]> {
    return this.http
      .get<{ data: PendingReconciliationPeriod[] }>(
        `${this.config.baseUrl}/bank-reconciliation-periods`,
        { context: this.requestContext(options) },
      )
      .pipe(map((response) => response.data));
  }

  private requestContext(options: ReconciliationRequestOptions): HttpContext {
    return new HttpContext().set(SKIP_GLOBAL_ALERT, options.skipGlobalAlert === true);
  }
}
