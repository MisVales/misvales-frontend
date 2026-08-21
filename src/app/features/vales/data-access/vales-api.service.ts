import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';

export interface VoucherProduct { id: string; product_id: string; code: string; name: string; nominal_amount: string; }
export interface VoucherClient { id: string; client_number: string; full_name: string; }
export interface VoucherCalculation {
  capital: string; loan_commission_percentage: string; loan_commission_amount: string;
  simple_interest_percentage: string; interest_total: string; insurance_amount: string;
  misvales_total: string; misvales_payment_per_fortnight: string;
  distributor_profit_percentage: string; distributor_profit_total: string;
  distributor_profit_per_fortnight: string; client_total: string;
  client_payment_per_fortnight: string; fortnights_count: number;
  interest_per_fortnight: string; capital_per_fortnight: string;
  net_payment_after_distributor_profit_per_fortnight: string;
  payment_with_late_fee: string; two_payments_with_late_fee: string;
}
export interface VoucherFinancialConditions { commission_rate: string; interest_rate: string; insurance_amount: string; installment_count: number; category_rate: string; late_fee_amount: string; }
export interface VoucherFinancialContext {
  category: { name: string; percentage: string };
  conditions: { commission_rate: string; interest_rate: string; insurance_amount: string; late_fee_amount: string };
}
export interface VoucherCreditLine { total_authorized: string; used_balance: string; available_balance: string; }
export interface VoucherPreview { voucher_type: 'PREVALE' | 'VALE_DIGITAL'; client: { id: string; client_number: string; full_name: string }; product: { id: string; version_id: string; code: string; name: string }; credit: { total_authorized: string; used_balance: string; available_balance: string; has_active_restriction: boolean; lower_limit: string | null; upper_limit: string | null }; financial_conditions: VoucherFinancialConditions; calculation: VoucherCalculation; }
export interface VoucherView extends VoucherCalculation { id: string; folio: string; type: 'PREVALE' | 'VALE_DIGITAL'; status: string; generated_at: string; client?: { id: string; client_number: string; full_name: string }; product?: { id: string; version_id: string; name: string }; }

@Injectable({ providedIn: 'root' })
export class ValesApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  listarProductos(): Observable<VoucherProduct[]> { return this.http.get<{ data: VoucherProduct[] }>(`${this.config.baseUrl}/voucher-products`).pipe(map(response => response.data)); }
  buscarClientesElegibles(search: string): Observable<VoucherClient[]> {
    return this.http.get<{ data: VoucherClient[] }>(`${this.config.baseUrl}/vouchers/eligible-clients`, {
      params: new HttpParams().set('search', search),
    }).pipe(map(response => response.data));
  }
  obtenerContextoFinanciero(): Observable<VoucherFinancialContext> { return this.http.get<{ data: VoucherFinancialContext }>(`${this.config.baseUrl}/vouchers/financial-context`).pipe(map(response => response.data)); }
  obtenerLineaCreditoPropia(): Observable<VoucherCreditLine> { return this.http.get<{ data: VoucherCreditLine }>(`${this.config.baseUrl}/me/credit-line`).pipe(map(response => response.data)); }
  previsualizar(clientId: string, productVersionId: string, installmentCount: number): Observable<VoucherPreview> { return this.http.post<{ data: VoucherPreview }>(`${this.config.baseUrl}/vouchers/preview`, { client_id: clientId, product_version_id: productVersionId, installment_count: installmentCount }).pipe(map(response => response.data)); }
  generar(clientId: string, productVersionId: string, installmentCount: number): Observable<VoucherView> { return this.http.post<{ data: VoucherView }>(`${this.config.baseUrl}/vouchers`, { client_id: clientId, product_version_id: productVersionId, installment_count: installmentCount }, { headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }) }).pipe(map(response => response.data)); }
  listar(page = 1): Observable<{ data: VoucherView[]; meta: { current_page: number; last_page: number; total: number } }> { return this.http.get<{ data: VoucherView[]; meta: { current_page: number; last_page: number; total: number } }>(`${this.config.baseUrl}/vouchers`, { params: new HttpParams().set('page', page).set('per_page', 15) }); }
  crearClienteRápido(firstName: string, firstLastName: string, secondLastName: string = ''): Observable<{ id: string; client_number: string; full_name: string }> {
    return this.http.post<{ data: { id: string; client_number: string; full_name: string } }>(`${this.config.baseUrl}/voucher-clients`, {
      first_name: firstName,
      first_last_name: firstLastName,
      second_last_name: secondLastName,
    }, { headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }) }).pipe(map(res => ({
      id: res.data.id,
      client_number: res.data.client_number,
      full_name: res.data.full_name
    })));
  }
}
