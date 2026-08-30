import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';

export interface VoucherProduct {
  id: string;
  product_id: string;
  code: string;
  name: string;
  nominal_amount: string;
  fortnights_count?: number;
}
export interface VoucherClient {
  id: string;
  client_number: string;
  full_name: string;
}
export interface NewClientRegistration {
  first_name: string;
  first_last_name: string;
  second_last_name: string;
  birth_date: string;
  phone_number: string;
  address: Record<string, string>;
}
export interface VoucherCalculation {
  capital: string;
  loan_commission_percentage: string;
  loan_commission_amount: string;
  simple_interest_percentage: string;
  interest_total: string;
  insurance_amount: string;
  misvales_total: string;
  misvales_payment_per_fortnight: string;
  distributor_profit_percentage: string;
  distributor_profit_total: string;
  distributor_profit_per_fortnight: string;
  client_total: string;
  client_payment_per_fortnight: string;
  fortnights_count: number;
  interest_per_fortnight: string;
  capital_per_fortnight: string;
  net_payment_after_distributor_profit_per_fortnight: string;
  payment_with_late_fee: string;
  two_payments_with_late_fee: string;
}
export interface VoucherFinancialConditions {
  commission_rate: string;
  interest_rate: string;
  insurance_amount: string;
  installment_count: number;
  category_rate: string;
  late_fee_amount: string;
}
export interface VoucherFinancialContext {
  category: { name: string; percentage: string };
}
export interface VoucherCreditLine {
  total_authorized: string;
  used_balance: string;
  available_balance: string;
}
export interface VoucherPreview {
  voucher_type: 'PREVALE' | 'VALE_DIGITAL';
  client: { id: string; client_number: string; full_name: string };
  product: { id: string; version_id: string; code: string; name: string };
  credit: {
    total_authorized: string;
    used_balance: string;
    available_balance: string;
    has_active_restriction: boolean;
    lower_limit: string | null;
    upper_limit: string | null;
  };
  financial_conditions: VoucherFinancialConditions;
  calculation: VoucherCalculation;
}
export interface VoucherInstallment {
  number: number;
  client_payment: string;
  due_at?: string | null;
  status: 'PENDING' | 'OVERDUE' | 'SETTLED' | 'PARTIALLY_PAID';
}
export interface VoucherView extends VoucherCalculation {
  id: string;
  folio: string;
  type: 'PREVALE' | 'VALE_DIGITAL';
  status: string;
  generated_at: string;
  client?: { id: string; client_number: string; full_name: string };
  product?: { id: string; version_id: string; name: string };
  installments?: VoucherInstallment[];
}

@Injectable({ providedIn: 'root' })
export class ValesApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  listarProductos(): Observable<VoucherProduct[]> {
    return this.http
      .get<{ data: VoucherProduct[] }>(`${this.config.baseUrl}/voucher-products`)
      .pipe(map((response) => response.data));
  }
  buscarClientesElegibles(search: string): Observable<VoucherClient[]> {
    return this.http
      .get<{ data: VoucherClient[] }>(`${this.config.baseUrl}/vouchers/eligible-clients`, {
        params: new HttpParams().set('search', search),
      })
      .pipe(map((response) => response.data));
  }
  obtenerContextoFinanciero(): Observable<VoucherFinancialContext> {
    return this.http
      .get<{ data: VoucherFinancialContext }>(`${this.config.baseUrl}/vouchers/financial-context`)
      .pipe(map((response) => response.data));
  }
  obtenerLineaCreditoPropia(): Observable<VoucherCreditLine> {
    return this.http
      .get<{ data: VoucherCreditLine }>(`${this.config.baseUrl}/me/credit-line`)
      .pipe(map((response) => response.data));
  }
  previsualizar(
    clientId: string,
    productVersionId: string,
  ): Observable<VoucherPreview> {
    return this.http
      .post<{ data: VoucherPreview }>(`${this.config.baseUrl}/vouchers/preview`, {
        client_id: clientId,
        product_version_id: productVersionId,
      })
      .pipe(map((response) => response.data));
  }
  generar(
    clientId: string,
    productVersionId: string,
  ): Observable<VoucherView> {
    return this.http
      .post<{ data: VoucherView }>(
        `${this.config.baseUrl}/vouchers`,
        {
          client_id: clientId,
          product_version_id: productVersionId,
        },
        { headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }) },
      )
      .pipe(map((response) => response.data));
  }
  cancelar(id: string): Observable<VoucherView> {
    return this.http
      .post<{ data: VoucherView }>(
        `${this.config.baseUrl}/vouchers/${id}/cancel`,
        {},
        { headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }) },
      )
      .pipe(map((response) => response.data));
  }
  listar(
    page = 1,
    status = '',
    clientId = '',
  ): Observable<{
    data: VoucherView[];
    meta: { current_page: number; last_page: number; total: number };
  }> {
    let params = new HttpParams().set('page', page).set('per_page', 15);
    if (status) params = params.set('status', status);
    if (clientId) params = params.set('client_id', clientId);
    return this.http.get<{
      data: VoucherView[];
      meta: { current_page: number; last_page: number; total: number };
    }>(`${this.config.baseUrl}/vouchers`, { params });
  }
  crearClienteCompleto(
    datos: NewClientRegistration,
    ineFront: File,
    addressProof: File,
  ): Observable<VoucherClient> {
    return this.http
      .post<{ data: { id: string } }>(`${this.config.baseUrl}/client-registration-drafts`, datos, {
        headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }),
      })
      .pipe(
        switchMap(({ data: draft }) =>
          forkJoin({
            ine: this.subirArchivo(draft.id, ineFront, 'CLIENT_INE_FRONT'),
            address: this.subirArchivo(draft.id, addressProof, 'ADDRESS_PROOF'),
          }).pipe(
            switchMap(() =>
              this.http.post<{ data: VoucherClient }>(
                `${this.config.baseUrl}/client-registration-drafts/${draft.id}/complete`,
                {},
                { headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }) },
              ),
            ),
          ),
        ),
        map(({ data }) => ({
          id: data.id,
          client_number: data.client_number,
          full_name: data.full_name,
        })),
      );
  }

  private subirArchivo(draftId: string, file: File, purpose: 'CLIENT_INE_FRONT' | 'ADDRESS_PROOF') {
    const body = new FormData();
    body.append('file', file);
    body.append('owner_type', 'client_registration_draft');
    body.append('owner_id', draftId);
    body.append('purpose', purpose);
    return this.http.post(`${this.config.baseUrl}/media`, body, {
      headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }),
    });
  }
}
