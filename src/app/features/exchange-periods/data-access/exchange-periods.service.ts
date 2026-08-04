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
    return `${this.apiConfig.baseUrl}/exchange-periods`;
  }

  listar(pagina: number = 1, porPagina: number = 10, estado?: string): Observable<PaginacionRespuestaDTO<PeriodoCanjeDTO>> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('perPage', porPagina.toString());
      
    if (estado) params = params.set('estado', estado);

    return this.http.get<PaginacionRespuestaDTO<PeriodoCanjeDTO>>(`${this.baseUrl}`, { params });
  }

  consultarDetalle(id: string): Observable<PeriodoCanjeDTO> {
    return this.http.get<PeriodoCanjeDTO>(`${this.baseUrl}/${id}`);
  }

  crearPeriodo(datos: CrearPeriodoDTO): Observable<PeriodoCanjeDTO> {
    return this.http.post<PeriodoCanjeDTO>(`${this.baseUrl}`, datos);
  }

  modificarBorrador(id: string, datos: ModificarPeriodoDTO, versionRegistro: number): Observable<PeriodoCanjeDTO> {
    const headers = new HttpHeaders().set('If-Match', versionRegistro.toString());
    return this.http.put<PeriodoCanjeDTO>(`${this.baseUrl}/${id}`, datos, { headers });
  }

  publicar(id: string, versionRegistro: number): Observable<PeriodoCanjeDTO> {
    const headers = new HttpHeaders().set('If-Match', versionRegistro.toString());
    return this.http.patch<PeriodoCanjeDTO>(`${this.baseUrl}/${id}/publicar`, {}, { headers });
  }

  cancelarFuturo(id: string, versionRegistro: number): Observable<PeriodoCanjeDTO> {
    const headers = new HttpHeaders().set('If-Match', versionRegistro.toString());
    return this.http.delete<PeriodoCanjeDTO>(`${this.baseUrl}/${id}`, { headers });
  }
}
