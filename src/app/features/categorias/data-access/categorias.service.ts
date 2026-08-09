import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';
import { CategoryDto, CategoryListResponseDto, CreateCategoryRequestDto, UpdateCategoryRequestDto } from './categorias.dtos';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private http = inject(HttpClient);
  private apiConfig = inject(API_CONFIG);

  private get baseUrl() {
    return `${this.apiConfig.baseUrl}/categories`;
  }

  private generateIdempotencyKey(): string {
    return crypto.randomUUID();
  }

  private generateRequestId(): string {
    return crypto.randomUUID();
  }

  listar(pagina: number = 1, porPagina: number = 10, busqueda?: string): Observable<CategoryListResponseDto> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('per_page', porPagina.toString());
      
    if (busqueda) {
      params = params.set('search', busqueda);
    }
      
    return this.http.get<CategoryListResponseDto>(`${this.baseUrl}`, { params });
  }

  consultarDetalle(id: string): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.baseUrl}/${id}`);
  }

  crear(datos: CreateCategoryRequestDto): Observable<CategoryDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('Idempotency-Key', this.generateIdempotencyKey());
      
    return this.http.post<CategoryDto>(`${this.baseUrl}`, datos, { headers });
  }

  actualizar(id: string, datos: UpdateCategoryRequestDto): Observable<CategoryDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('If-Match', datos.lock_version.toString());
      
    return this.http.put<CategoryDto>(`${this.baseUrl}/${id}`, datos, { headers });
  }

  cambiarEstado(id: string, nuevoEstado: 'ACTIVE' | 'INACTIVE', versionRegistro: number): Observable<CategoryDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('If-Match', versionRegistro.toString());
      
    return this.http.patch<CategoryDto>(`${this.baseUrl}/${id}/status`, { status: nuevoEstado }, { headers });
  }
}
