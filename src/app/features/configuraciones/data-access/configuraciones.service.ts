import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';
import { 
  ConfigurationDefinitionDto, 
  ConfigurationListResponseDto, 
  ConfigurationVersionDto, 
  ConfigurationVersionListResponseDto, 
  CreateConfigurationVersionRequestDto, 
  UpdateConfigurationVersionRequestDto 
} from './configuraciones.dtos';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionesService {
  private http = inject(HttpClient);
  private apiConfig = inject(API_CONFIG);

  private get baseUrl() {
    return `${this.apiConfig.baseUrl}/configurations`;
  }
  
  private get versionsBaseUrl() {
    return `${this.apiConfig.baseUrl}/configuration-versions`;
  }

  private generateIdempotencyKey(): string {
    return crypto.randomUUID();
  }

  private generateRequestId(): string {
    return crypto.randomUUID();
  }

  listar(pagina: number = 1, porPagina: number = 10): Observable<ConfigurationListResponseDto> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('per_page', porPagina.toString());
      
    return this.http.get<ConfigurationListResponseDto>(`${this.baseUrl}`, { params });
  }

  consultarDefinicion(clave: string): Observable<ConfigurationDefinitionDto> {
    return this.http.get<ConfigurationDefinitionDto>(`${this.baseUrl}/${clave}`);
  }

  consultarVersiones(clave: string): Observable<ConfigurationVersionListResponseDto> {
    return this.http.get<ConfigurationVersionListResponseDto>(`${this.baseUrl}/${clave}/versions`);
  }

  crearVersion(clave: string, datos: CreateConfigurationVersionRequestDto): Observable<ConfigurationVersionDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('Idempotency-Key', this.generateIdempotencyKey());
      
    return this.http.post<ConfigurationVersionDto>(`${this.baseUrl}/${clave}/versions`, datos, { headers });
  }

  consultarVersion(id: string): Observable<ConfigurationVersionDto> {
    return this.http.get<ConfigurationVersionDto>(`${this.versionsBaseUrl}/${id}`);
  }

  modificarVersion(id: string, datos: UpdateConfigurationVersionRequestDto): Observable<ConfigurationVersionDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('If-Match', datos.lock_version.toString());
      
    // En el DTO enviamos lock_version, pero también en la cabecera If-Match como pide la especificación.
    return this.http.patch<ConfigurationVersionDto>(`${this.versionsBaseUrl}/${id}`, datos, { headers });
  }

  publicarVersion(id: string, versionRegistro: number, motivo: string): Observable<ConfigurationVersionDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('Idempotency-Key', this.generateIdempotencyKey())
      .set('If-Match', versionRegistro.toString());
      
    return this.http.post<ConfigurationVersionDto>(`${this.versionsBaseUrl}/${id}/publish`, { reason: motivo }, { headers });
  }

  desactivarVersion(id: string, versionRegistro: number, motivo: string): Observable<ConfigurationVersionDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('Idempotency-Key', this.generateIdempotencyKey())
      .set('If-Match', versionRegistro.toString());
      
    return this.http.post<ConfigurationVersionDto>(`${this.versionsBaseUrl}/${id}/deactivate`, { reason: motivo }, { headers });
  }
}
