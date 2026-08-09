import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
      
    return this.http.get<ExchangePeriodListResponseDto>(`${this.baseUrl}`, { params });
  }

  consultarDetalle(id: string): Observable<ExchangePeriodDto> {
    return this.http.get<ExchangePeriodDto>(`${this.baseUrl}/${id}`);
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
      
    return this.http.put<ExchangePeriodDto>(`${this.baseUrl}/${id}`, datos, { headers });
  }
}
