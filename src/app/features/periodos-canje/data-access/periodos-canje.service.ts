import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';
import { ExchangePeriodDto, ExchangePeriodListResponseDto, CreateExchangePeriodRequestDto, UpdateExchangePeriodRequestDto } from './periodos-canje.dtos';

@Injectable({
  providedIn: 'root'
})
export class PeriodosCanjeService {
  private http = inject(HttpClient);
  private apiConfig = inject(API_CONFIG);

  private get baseUrl() {
    return `${this.apiConfig.baseUrl}/redemption-periods`;
  }

  private generateIdempotencyKey(): string {
    return crypto.randomUUID();
  }

  private generateRequestId(): string {
    return crypto.randomUUID();
  }

  listar(pagina: number = 1, porPagina: number = 10, estado?: string): Observable<ExchangePeriodListResponseDto> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('per_page', porPagina.toString());
      
    if (estado) {
      params = params.set('status', estado);
    }
      
    return this.http.get<any[]>(`${this.baseUrl}`, { params }).pipe(map((rows) => ({
      data: rows.map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        description: row.description ?? null,
        start_date: row.starts_at,
        end_date: row.ends_at,
        status: row.status,
        created_at: row.created_at,
        lock_version: row.lock_version,
      })),
      meta: { current_page: pagina, last_page: 1, total: rows.length },
    })));
  }

  consultarDetalle(id: string): Observable<ExchangePeriodDto> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map((row) => ({ ...row, start_date: row.starts_at, end_date: row.ends_at })));
  }

  crear(datos: CreateExchangePeriodRequestDto): Observable<ExchangePeriodDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('Idempotency-Key', this.generateIdempotencyKey());
      
    return this.http.post<ExchangePeriodDto>(`${this.baseUrl}`, datos, { headers });
  }

  actualizar(id: string, datos: UpdateExchangePeriodRequestDto): Observable<ExchangePeriodDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('If-Match', datos.lock_version.toString());
      
    return this.http.patch<ExchangePeriodDto>(`${this.baseUrl}/${id}`, datos, { headers });
  }

  publicar(id: string, lockVersion: number, reason: string): Observable<ExchangePeriodDto> {
    return this.http.post<ExchangePeriodDto>(`${this.baseUrl}/${id}/publish`, { lock_version: lockVersion, reason });
  }

  cancelar(id: string, lockVersion: number, reason: string): Observable<ExchangePeriodDto> {
    return this.http.post<ExchangePeriodDto>(`${this.baseUrl}/${id}/cancel`, { lock_version: lockVersion, reason });
  }
}
