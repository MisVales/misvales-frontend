import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';
import { VoucherView } from '@features/vouchers/data-access/vales-api.service';

export interface CashVoucher extends VoucherView {
  distributor?: { id: string; distributor_number: string; full_name: string | null };
  identity?: {
    official_id_type: string | null;
    official_id_number: string | null;
    official_id_number_masked: string | null;
    official_id_media_id: string | null;
  };
  document_owner?: { owner_type: 'distributor_application'; owner_id: string } | null;
  address?: Record<string, string | null>;
  bank_account?: { bank_name: string | null; account_holder_name: string; clabe_masked: string | null };
  client_verification?: {
    id: string;
    first_name: string;
    first_last_name: string;
    second_last_name: string | null;
    full_name: string;
    birth_date: string | null;
    phone_number: string | null;
    curp_masked: string | null;
    identity: { official_id_type: string | null; official_id_media_id: string | null };
    address: Record<string, string | null> | null;
  } | null;
  released_at?: string;
  cashed_at?: string;
  lock_version: number;
  modification_request?: {
    id: string;
    lock_version: number;
    status: 'REQUESTED' | 'AUTHORIZED';
  } | null;
}
export interface ModificationChanges {
  first_name?: string;
  first_last_name?: string;
  second_last_name?: string;
  birth_date?: string;
  phone_number?: string;
  curp?: string;
  address?: Record<string, string>;
}
export interface ModificationRequest {
  id: string;
  voucher_id: string;
  client_id: string;
  branch_id: string;
  requested_fields: Array<'first_name' | 'first_last_name' | 'second_last_name' | 'birth_date' | 'phone_number' | 'curp' | 'address'>;
  requested_changes: ModificationChanges | null;
  changes_before?: ModificationChanges | null;
  changes_after?: ModificationChanges | null;
  reason?: string | null;
  status: string;
  lock_version: number;
  vale?: CashVoucher;
}
export interface PrivateMediaFile { id: string; }

@Injectable({ providedIn: 'root' })
export class CajaValesApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  list(scope: 'pending' | 'history'): Observable<CashVoucher[]> {
    return this.http
      .get<{ data: CashVoucher[] }>(`${this.config.baseUrl}/cashier/vouchers`, {
        params: new HttpParams().set('scope', scope).set('per_page', '50'),
      })
      .pipe(map((response) => response.data));
  }
  search(term: string): Observable<CashVoucher[]> {
    return this.http
      .get<{ data: CashVoucher[] }>(`${this.config.baseUrl}/cashier/vouchers/search`, {
        params: new HttpParams().set('search', term),
      })
      .pipe(map((response) => response.data));
  }
  detail(id: string): Observable<CashVoucher> {
    return this.http
      .get<{ data: CashVoucher }>(`${this.config.baseUrl}/cashier/vouchers/${id}`)
      .pipe(map((response) => response.data));
  }
  release(id: string, lock_version: number): Observable<CashVoucher> {
    return this.post<CashVoucher>(`${this.config.baseUrl}/cashier/vouchers/${id}/release`, { lock_version, matches: true });
  }
  cash(id: string, paymentMethod: 'CASH' | 'TRANSFER', transaction: string, clabe: string, lockVersion: number): Observable<CashVoucher> {
    return this.post<CashVoucher>(`${this.config.baseUrl}/cashier/vouchers/${id}/cash`, {
      payment_method: paymentMethod,
      bank_transaction_number: transaction,
      clabe: clabe || undefined,
      lock_version: lockVersion,
    });
  }
  requestModification(
    id: string,
    fields: Array<'first_name' | 'first_last_name' | 'second_last_name' | 'birth_date' | 'phone_number' | 'curp' | 'address'>,
    changes: ModificationChanges,
  ): Observable<ModificationRequest> {
    return this.post<ModificationRequest>(
      `${this.config.baseUrl}/cashier/vouchers/${id}/modification-requests`,
      { fields, changes },
    );
  }
  listModifications(): Observable<ModificationRequest[]> {
    return this.http
      .get<{ data: ModificationRequest[] }>(`${this.config.baseUrl}/voucher-modification-requests`)
      .pipe(map((response) => response.data));
  }
  decide(
    id: string,
    decision: 'AUTHORIZE' | 'REJECT',
    lockVersion: number,
  ): Observable<{ request: ModificationRequest; token: string | null; expires_at: string | null }> {
    return this.post(`${this.config.baseUrl}/voucher-modification-requests/${id}/decision`, {
      decision,
      lock_version: lockVersion,
    });
  }
  apply(
    id: string,
    token: string,
    lockVersion: number,
  ): Observable<ModificationRequest> {
    return this.post(`${this.config.baseUrl}/voucher-modification-requests/${id}/apply`, {
      token,
      lock_version: lockVersion,
    });
  }
  uploadAddressProof(applicationId: string, file: File): Observable<PrivateMediaFile> {
    const body = new FormData();
    body.append('file', file);
    body.append('owner_type', 'distributor_application');
    body.append('owner_id', applicationId);
    body.append('purpose', 'ADDRESS_PROOF');
    return this.http.post<{ data: PrivateMediaFile }>(`${this.config.baseUrl}/media`, body, {
      headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }),
    }).pipe(map((response) => response.data));
  }
  private post<T>(url: string, body: object): Observable<T> {
    return this.http
      .post<{ data: T }>(url, body, {
        headers: new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() }),
      })
      .pipe(map((response) => response.data));
  }
}
