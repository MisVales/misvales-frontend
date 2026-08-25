import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';

export interface ErrorCatalogItem {
  code: string;
  client_message: string;
  client_messages: string[];
  http_statuses: number[];
}

export interface ErrorCatalogResponse {
  data: ErrorCatalogItem[];
  meta: { total: number };
}

@Injectable({ providedIn: 'root' })
export class ErrorCatalogService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  list(): Observable<ErrorCatalogResponse> {
    return this.http.get<ErrorCatalogResponse>(`${this.config.baseUrl}/error-catalog`);
  }
}
