import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';
import { ConfiguracionDTO, CrearVersionDTO, HistorialVersionesDTO, ModificarVersionDTO, PaginacionRespuestaDTO } from './configurations.dtos';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionesService {
  private http = inject(HttpClient);
  private apiConfig = inject(API_CONFIG);

  private get baseUrl() {
    return `${this.apiConfig.baseUrl}/configurations`;
  }

  listar(pagina: number = 1, porPagina: number = 10, grupo?: string, estado?: string): Observable<PaginacionRespuestaDTO<ConfiguracionDTO>> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('perPage', porPagina.toString());
      
    if (grupo) params = params.set('grupo', grupo);
    if (estado) params = params.set('estado', estado);

    return this.http.get<PaginacionRespuestaDTO<ConfiguracionDTO>>(`${this.baseUrl}`, { params });
  }

  consultarVigente(clave: string): Observable<ConfiguracionDTO> {
    return this.http.get<ConfiguracionDTO>(`${this.baseUrl}/${clave}/vigente`);
  }

  consultarHistorial(clave: string): Observable<HistorialVersionesDTO[]> {
    return this.http.get<HistorialVersionesDTO[]>(`${this.baseUrl}/${clave}/historial`);
  }

  crearVersion(datos: CrearVersionDTO): Observable<ConfiguracionDTO> {
    return this.http.post<ConfiguracionDTO>(`${this.baseUrl}`, datos);
  }

  modificarBorrador(idVersion: string, datos: ModificarVersionDTO, versionRegistro: number): Observable<ConfiguracionDTO> {
    const headers = new HttpHeaders().set('If-Match', versionRegistro.toString());
    return this.http.put<ConfiguracionDTO>(`${this.baseUrl}/versiones/${idVersion}`, datos, { headers });
  }

  publicarVersion(idVersion: string, versionRegistro: number): Observable<ConfiguracionDTO> {
    const headers = new HttpHeaders().set('If-Match', versionRegistro.toString());
    return this.http.patch<ConfiguracionDTO>(`${this.baseUrl}/versiones/${idVersion}/publicar`, {}, { headers });
  }

  desactivarVersion(idVersion: string, versionRegistro: number): Observable<ConfiguracionDTO> {
    const headers = new HttpHeaders().set('If-Match', versionRegistro.toString());
    return this.http.delete<ConfiguracionDTO>(`${this.baseUrl}/versiones/${idVersion}`, { headers });
  }
}
