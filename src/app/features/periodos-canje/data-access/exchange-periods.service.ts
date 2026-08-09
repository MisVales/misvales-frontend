import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';
import { CrearPeriodoDTO, ModificarPeriodoDTO, PaginacionRespuestaDTO, PeriodoCanjeDTO } from './exchange-periods.dtos';

@Injectable({
  providedIn: 'root'
})
export class PeriodosCanjeService {
  private http = inject(HttpClient);
  private apiConfig = inject(API_CONFIG);

  private get baseUrl() {
    return `${this.apiConfig.baseUrl}/redemption-periods`;
  }

  listar(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}`);
  }

  consultarDetalle(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  crearPeriodo(datos: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, datos);
  }

  modificarBorrador(id: string, datos: any, lock_version: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, { ...datos, lock_version });
  }

  publicar(id: string, lock_version: number, motivo: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/publish`, { lock_version, reason: motivo });
  }

  cancelarFuturo(id: string, lock_version: number, motivo: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/cancel`, { lock_version, reason: motivo });
  }
}
