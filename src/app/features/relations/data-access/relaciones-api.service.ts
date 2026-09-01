import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';

export interface RelationItem {
  id: string;
  snapshot: Record<string, string | number>;
  portfolio_amount: string;
  misvales_amount: string;
  occurrence_type?: 'INSTALLMENT' | 'TERMINAL_OVERDUE';
  source_voucher_installment_id?: string | null;
  previous_terminal_occurrence_id?: string | null;
  terminal_sequence?: number | null;
}
export interface VoucherOccurrenceSummary {
  relation_id: string;
  relation_item_id: string;
  occurrence_type: 'INSTALLMENT' | 'TERMINAL_OVERDUE';
  installment: number;
  total_installments: number;
  terminal_sequence?: number | null;
  cumulative_misvales_due: string;
  cumulative_surcharge: string;
  cumulative_forfeited_profit: string;
}
export interface VoucherFinancialSummary {
  voucher_id: string;
  folio: string;
  client: string;
  product: string;
  total_installments: number;
  cumulative_misvales_due: string;
  cumulative_surcharge: string;
  cumulative_forfeited_profit: string;
  amount_owed?: string;
  amount_paid?: string;
  capital_owed?: string;
  capital_paid?: string;
  capital_pending?: string;
  interest_pending?: string;
  insurance_pending?: string;
  commission_pending?: string;
  current_amount?: string;
  overdue_amount?: string;
  accumulated_surcharges?: string;
  pending_balance?: string;
  is_settled?: boolean;
  financial_status?: string;
  current_installment?: number | null;
  occurrences: VoucherOccurrenceSummary[];
}
export type PaymentComponent =
  'SURCHARGE' | 'INTEREST' | 'INSURANCE' | 'LOAN_COMMISSION' | 'CAPITAL';

export interface PaymentAllocation {
  id: string;
  payment_id: string;
  relation_item_id: string;
  voucher_id?: string | null;
  component: PaymentComponent;
  amount: string;
  partida_relacion?: RelationItem;
}
export interface CreditLineInfo {
  id?: string;
  total_authorized: string;
  used_balance: string;
  saldo_disponible?: string;
}

export interface DistributorInfo {
  id: string;
  distributor_number?: string;
  status?: string;
  branch_id?: string;
  usuario?: {
    id?: string;
    name?: string;
    email?: string;
  };
  sucursal?: {
    id?: string;
    name?: string;
  };
  linea_credito?: CreditLineInfo;
  lineaCredito?: CreditLineInfo;
}

export interface PaymentItem {
  id: string;
  relation_id: string;
  bank_movement_id?: string | null;
  target_voucher_id?: string | null;
  source_type?: string;
  source_id?: string;
  amount: string;
  applied_at: string;
  surcharge_applied: string;
  interest_applied: string;
  insurance_applied: string;
  commission_applied: string;
  capital_applied: string;
  line_recovered: string;
  trace_snapshot?: Array<Record<string, unknown>> | null;
  asignaciones?: PaymentAllocation[];
  bank_movement?: {
    amount: string;
    applied_amount: string;
    surplus_amount: string;
    bank_folio: string;
  } | null;
}

export interface RelationView {
  id: string;
  distributor_id?: string;
  payment_reference: string;
  cutoff_at: string;
  payment_deadline_at: string;
  advance_period_start: string;
  advance_period_end: string;
  financial_status: string;
  review_status: string;
  portfolio_total: string;
  misvales_total: string;
  reconciled_total: string;
  surcharge_total: string;
  previous_relation_id?: string | null;
  rolled_forward_to_id?: string | null;
  rolled_forward_amount?: string;
  carried_balance?: string;
  carried_surcharge?: string;
  carried_interest?: string;
  carried_insurance?: string;
  carried_commission?: string;
  carried_capital?: string;
  balance: string;
  distribuidora?: DistributorInfo;
  header_snapshot: {
    number?: string | null;
    name?: string | null;
    address?: string | null;
    branch?: string | null;
    coordinator?: string | null;
    credit_line_total?: string | number | null;
    credit_available?: string | number | null;
    configuration_versions?: Record<string, string>;
  };
  bank_snapshot: {
    name?: string | null;
    beneficiary?: string | null;
    agreement?: string | null;
    clabe?: string | null;
  };
  partidas?: RelationItem[];
  voucher_summaries?: VoucherFinancialSummary[];
  voucher_balance_total?: string;
  settled_at?: string;
  temporal_classification?: string;
  pagos?: PaymentItem[];
  puntos_ganados?: Array<{ id: string; points: number }>;
}

export interface RelationFilterParams {
  search?: string;
  status?: string;
  cutoff?: string;
  per_page?: number;
  page?: number;
}

export interface PaginatedRelations {
  data: RelationView[];
  current_page: number;
  last_page: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class RelacionesApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  list(filters?: RelationFilterParams): Observable<PaginatedRelations> {
    let params: Record<string, string> = {};
    if (filters?.search) params['search'] = filters.search;
    if (filters?.status) params['status'] = filters.status;
    if (filters?.cutoff) params['cutoff'] = filters.cutoff;
    if (filters?.per_page) params['per_page'] = String(filters.per_page);
    if (filters?.page) params['page'] = String(filters.page);

    return this.http
      .get<{ data: PaginatedRelations }>(`${this.config.baseUrl}/relations`, { params })
      .pipe(map((r) => r.data));
  }

  detail(id: string): Observable<RelationView> {
    return this.http
      .get<{ data: RelationView }>(`${this.config.baseUrl}/relations/${id}`)
      .pipe(map((r) => r.data));
  }

  download(id: string): Observable<Blob> {
    return this.http.get(`${this.config.baseUrl}/relations/${id}/download`, {
      responseType: 'blob',
    });
  }

  downloadAccountStatement(distributorId: string): Observable<Blob> {
    return this.http.get(`${this.config.baseUrl}/distributors/${distributorId}/account-statement`, {
      responseType: 'blob',
    });
  }
}
