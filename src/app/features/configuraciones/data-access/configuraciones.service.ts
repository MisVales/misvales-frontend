import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';
import { 
  ConfigurationDefinitionDto, 
  ApiResource,
  ConfigurationVersionDto, 
  CreateConfigurationVersionRequestDto, 
  UpdateConfigurationVersionRequestDto 
} from './configuraciones.dtos';
import { esConfiguracionVisible } from './configuraciones-visibilidad';

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

  listar(): Observable<ConfigurationDefinitionDto[]> {
    return this.http
      .get<ApiResource<ConfigurationDefinitionDto[]>>(this.baseUrl)
      .pipe(map((response) => response.data.filter((definition) => esConfiguracionVisible(definition.key))));
  }

  consultarDefinicion(clave: string): Observable<ConfigurationDefinitionDto> {
    return this.http
      .get<ApiResource<ConfigurationDefinitionDto>>(`${this.baseUrl}/${clave}`)
      .pipe(map((response) => response.data));
  }

  consultarVersiones(clave: string): Observable<ConfigurationVersionDto[]> {
    return this.http
      .get<ApiResource<ConfigurationVersionDto[]>>(`${this.baseUrl}/${clave}/versions`)
      .pipe(map((response) => response.data));
  }

  crearVersion(clave: string, datos: CreateConfigurationVersionRequestDto): Observable<ConfigurationVersionDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('Idempotency-Key', this.generateIdempotencyKey());
      
    return this.http
      .post<ApiResource<ConfigurationVersionDto>>(`${this.baseUrl}/${clave}/versions`, datos, { headers })
      .pipe(map((response) => response.data));
  }

  consultarVersion(id: string): Observable<ConfigurationVersionDto> {
    return this.http
      .get<ApiResource<ConfigurationVersionDto>>(`${this.versionsBaseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  modificarVersion(id: string, datos: UpdateConfigurationVersionRequestDto): Observable<ConfigurationVersionDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('If-Match', datos.lock_version.toString());
      
    // En el DTO enviamos lock_version, pero también en la cabecera If-Match como pide la especificación.
    return this.http
      .patch<ApiResource<ConfigurationVersionDto>>(`${this.versionsBaseUrl}/${id}`, datos, { headers })
      .pipe(map((response) => response.data));
  }

  publicarVersion(id: string, versionRegistro: number, motivo: string): Observable<ConfigurationVersionDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('Idempotency-Key', this.generateIdempotencyKey())
      .set('If-Match', versionRegistro.toString());
      
    return this.http
      .post<ApiResource<ConfigurationVersionDto>>(
        `${this.versionsBaseUrl}/${id}/publish`,
        { reason: motivo, lock_version: versionRegistro },
        { headers },
      )
      .pipe(map((response) => response.data));
  }

  desactivarVersion(id: string, versionRegistro: number, motivo: string): Observable<ConfigurationVersionDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('Idempotency-Key', this.generateIdempotencyKey())
      .set('If-Match', versionRegistro.toString());
      
    return this.http
      .post<ApiResource<ConfigurationVersionDto>>(
        `${this.versionsBaseUrl}/${id}/deactivate`,
        { reason: motivo, lock_version: versionRegistro },
        { headers },
      )
      .pipe(map((response) => response.data));
  }
}
