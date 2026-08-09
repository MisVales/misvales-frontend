import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';
import { ProductDto, ProductListResponseDto, CreateProductRequestDto, UpdateProductRequestDto } from './productos.dtos';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private http = inject(HttpClient);
  private apiConfig = inject(API_CONFIG);

  private get baseUrl() {
    return `${this.apiConfig.baseUrl}/products`;
  }

  private generateIdempotencyKey(): string {
    return crypto.randomUUID();
  }

  private generateRequestId(): string {
    return crypto.randomUUID();
  }

  listar(pagina: number = 1, porPagina: number = 10, busqueda?: string): Observable<ProductListResponseDto> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('per_page', porPagina.toString());
      
    if (busqueda) {
      params = params.set('search', busqueda);
    }
      
    return this.http.get<ProductListResponseDto>(`${this.baseUrl}`, { params });
  }

  consultarDetalle(id: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.baseUrl}/${id}`);
  }

  crear(datos: CreateProductRequestDto): Observable<ProductDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('Idempotency-Key', this.generateIdempotencyKey());
      
    return this.http.post<ProductDto>(`${this.baseUrl}`, datos, { headers });
  }

  actualizar(id: string, datos: UpdateProductRequestDto): Observable<ProductDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('If-Match', datos.lock_version.toString());
      
    return this.http.put<ProductDto>(`${this.baseUrl}/${id}`, datos, { headers });
  }

  cambiarEstado(id: string, nuevoEstado: 'ACTIVE' | 'INACTIVE', versionRegistro: number): Observable<ProductDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('If-Match', versionRegistro.toString());
      
    return this.http.patch<ProductDto>(`${this.baseUrl}/${id}/status`, { status: nuevoEstado }, { headers });
  }
}
