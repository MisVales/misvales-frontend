import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';
export interface BankImport {
  id: string;
  status: string;
  row_count: number;
  summary?: Record<string, number>;
  error?: string;
  created_at: string;
}
export interface BankMovement {
  id: string;
  payment_reference: string;
  amount: string;
  paid_at: string;
  bank_folio: string;
  concept: string;
  classification: string;
  applied_amount: string;
  surplus_amount: string;
  relation_id: string | null;
}
@Injectable({ providedIn: 'root' })
export class ConciliacionApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  upload(file: File): Observable<BankImport> {
    const data = new FormData();
    data.append('file', file);
    return this.http
      .post<{ data: BankImport }>(`${this.config.baseUrl}/bank-imports`, data)
      .pipe(map((r) => r.data));
  }
  imports(): Observable<BankImport[]> {
    return this.http
      .get<{ data: { data: BankImport[] } }>(`${this.config.baseUrl}/bank-imports`)
      .pipe(map((r) => r.data.data));
  }
  movements(): Observable<BankMovement[]> {
    return this.http
      .get<{ data: { data: BankMovement[] } }>(`${this.config.baseUrl}/bank-movements`)
      .pipe(map((r) => r.data.data));
  }
}
