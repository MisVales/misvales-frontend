import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';

export interface RelationItem {
  id: string;
  snapshot: Record<string, string | number>;
  portfolio_amount: string;
  misvales_amount: string;
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
  settled_at?: string;
  temporal_classification?: string;
  pagos?: PaymentItem[];
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
}
