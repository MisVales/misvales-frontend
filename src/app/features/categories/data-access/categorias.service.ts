import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';
import { CategoryDto, CategoryListResponseDto, CreateCategoryRequestDto, UpdateCategoryRequestDto } from './categorias.dtos';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private get baseUrl() { return `${this.apiConfig.baseUrl}/categories`; }

  listar(pagina = 1, porPagina = 10, busqueda?: string): Observable<CategoryListResponseDto> {
    let params = new HttpParams().set('page', pagina).set('per_page', porPagina);
    if (busqueda) params = params.set('search', busqueda);
    return this.http.get<any[]>(this.baseUrl, { params }).pipe(map((rows) => ({
      data: rows.map((row) => this.adapt(row)),
      meta: { current_page: pagina, last_page: 1, total: rows.length },
    })));
  }

  consultarDetalle(id: string): Observable<CategoryDto> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map((row) => this.adapt(row)));
  }

  crear(datos: CreateCategoryRequestDto): Observable<CategoryDto> {
    const headers = new HttpHeaders().set('X-Request-Id', crypto.randomUUID()).set('Idempotency-Key', crypto.randomUUID());
    return this.http.post<any>(this.baseUrl, datos, { headers }).pipe(map((row) => this.adapt(row)));
  }

  actualizar(id: string, datos: UpdateCategoryRequestDto): Observable<CategoryDto> {
    return this.http.post<any>(`${this.baseUrl}/${id}/versions`, {
      name: datos.name, description: datos.description, profit_percentage: datos.profit_percentage,
      reason: datos.reason,
    }).pipe(map((version) => this.adapt({ id, code: '', status: 'ACTIVE', created_at: version.created_at, versions: [version] })));
  }

  cambiarEstado(id: string, nuevoEstado: 'ACTIVE' | 'INACTIVE', versionRegistro: number): Observable<CategoryDto> {
    if (nuevoEstado !== 'INACTIVE') throw new Error('La reactivación de categorías no está definida por el contrato backend.');
    return this.http.post<any>(`${this.baseUrl}/${id}/deactivate`, { lock_version: versionRegistro }).pipe(map((row) => this.adapt(row)));
  }

  publicarVersion(versionId: string, lockVersion: number, reason: string): Observable<unknown> {
    return this.http.post(`${this.apiConfig.baseUrl}/category-versions/${versionId}/publish`, { lock_version: lockVersion, reason });
  }

  private adapt(row: any): CategoryDto {
    const version = [...(row.versions ?? [])].sort((a, b) => b.version - a.version)[0] ?? row;
    return {
      id: row.id ?? version.category_id, version_id: version.id ?? '', code: row.code ?? '', name: version.name ?? row.code ?? '', description: version.description ?? null,
      status: row.status ?? 'ACTIVE', profit_margin: version.profit_percentage ?? '0', version_status: version.status ?? 'DRAFT',
      effective_from: version.effective_from ?? '', reason: version.reason ?? '', created_at: row.created_at ?? version.created_at,
      lock_version: version.lock_version ?? row.lock_version ?? 0,
    };
  }
}
