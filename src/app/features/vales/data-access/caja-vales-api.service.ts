import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';
import { VoucherView } from './vales-api.service';

export interface CashVoucher extends VoucherView {
  identity?: {
    official_id_type: string;
    official_id_number: string | null;
    official_id_number_masked: string | null;
    official_id_media_id: string | null;
  };
  address?: Record<string, string | null>;
  bank_account?: { bank_name: string; account_holder_name: string; clabe_masked: string };
  released_at?: string;
  cashed_at?: string;
  lock_version: number;
}
export interface ModificationRequest {
  id: string;
  voucher_id: string;
  client_id: string;
  branch_id: string;
  requested_fields: Array<'curp' | 'address'>;
  reason: string;
  status: string;
  lock_version: number;
  vale?: CashVoucher;
}
export interface PrivateMediaFile { id: string; }

@Injectable({ providedIn: 'root' })
export class CajaValesApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
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
  release(id: string, lock_version: number, bank_name?: string, clabe?: string): Observable<CashVoucher> {
    const payload: any = { lock_version };
    if (bank_name && clabe) {
      payload.bank_name = bank_name;
      payload.clabe = clabe;
    }
    return this.post<CashVoucher>(`${this.config.baseUrl}/cashier/vouchers/${id}/release`, payload);
  }
  cash(id: string, transaction: string, lockVersion: number): Observable<CashVoucher> {
    return this.post<CashVoucher>(`${this.config.baseUrl}/cashier/vouchers/${id}/cash`, {
      bank_transaction_number: transaction,
      lock_version: lockVersion,
    });
  }
  requestModification(
    id: string,
    fields: Array<'curp' | 'address'>,
    reason: string,
  ): Observable<ModificationRequest> {
    return this.post<ModificationRequest>(
      `${this.config.baseUrl}/cashier/vouchers/${id}/modification-requests`,
      { fields, reason },
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
    reason: string,
    lockVersion: number,
  ): Observable<{ request: ModificationRequest; token: string | null; expires_at: string | null }> {
    return this.post(`${this.config.baseUrl}/voucher-modification-requests/${id}/decision`, {
      decision,
      reason,
      lock_version: lockVersion,
    });
  }
  apply(
    id: string,
    token: string,
    changes: Record<string, unknown>,
    lockVersion: number,
  ): Observable<ModificationRequest> {
    return this.post(`${this.config.baseUrl}/voucher-modification-requests/${id}/apply`, {
      token,
      changes,
      lock_version: lockVersion,
    });
  }
  uploadAddressProof(clientId: string, file: File): Observable<PrivateMediaFile> {
    const body = new FormData();
    body.append('file', file);
    body.append('owner_type', 'client');
    body.append('owner_id', clientId);
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
