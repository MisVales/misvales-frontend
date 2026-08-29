import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
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
      
    return this.http.get<ProductListResponseDto | any[]>(`${this.baseUrl}`, { params }).pipe(map((response) => {
      const rows = Array.isArray(response) ? response : response.data ?? [];
      const meta = Array.isArray(response)
        ? { current_page: pagina, last_page: rows.length ? 1 : 1, total: rows.length }
        : response.meta;

      return {
      data: rows.map((row) => {
        const version = [...(row.versions ?? [])].sort((a, b) => b.version - a.version)[0] ?? {};
        return {
          id: row.id,
          version_id: version.id ?? '',
          code: row.code,
          name: version.name ?? row.code,
          description: version.description ?? null,
          status: row.status,
          nominal_amount: version.nominal_amount ?? '0',
          version_status: version.status ?? 'DRAFT',
           effective_from: version.effective_from ?? '',
           reason: version.reason ?? '',
           created_at: row.created_at,
           lock_version: version.lock_version ?? row.lock_version,
           loan_commission_percentage: version.loan_commission_percentage ?? row.loan_commission_percentage ?? null,
           simple_interest_percentage: version.simple_interest_percentage ?? row.simple_interest_percentage ?? null,
           insurance_amount: version.insurance_amount ?? row.insurance_amount ?? null,
           fortnights_count: version.fortnights_count ?? row.fortnights_count ?? null,
         late_fee_amount: version.late_fee_amount ?? row.late_fee_amount ?? null,
         };
      }),
      meta: { current_page: meta.current_page ?? pagina, last_page: meta.last_page ?? 1, total: meta.total ?? rows.length },
      };
    }));
  }

  consultarDetalle(id: string): Observable<ProductDto> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(map((row) => this.adapt(row)));
  }

  crear(datos: CreateProductRequestDto): Observable<ProductDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('Idempotency-Key', this.generateIdempotencyKey());
      
    return this.http.post<any>(`${this.baseUrl}`, datos, { headers }).pipe(map((row) => this.adapt(row)));
  }

  actualizar(id: string, datos: UpdateProductRequestDto): Observable<ProductDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('If-Match', datos.lock_version.toString());
      
    return this.http.post<any>(`${this.baseUrl}/${id}/versions`, datos, { headers }).pipe(map((version) => this.adapt({
      id, code: '', status: 'ACTIVE', created_at: version.created_at, versions: [version],
    })));
  }

  cambiarEstado(id: string, nuevoEstado: 'ACTIVE' | 'INACTIVE', versionRegistro: number): Observable<ProductDto> {
    const headers = new HttpHeaders()
      .set('X-Request-Id', this.generateRequestId())
      .set('If-Match', versionRegistro.toString());
      
    if (nuevoEstado !== 'INACTIVE') throw new Error('La API no permite reactivar productos desactivados.');
    return this.http.post<any>(`${this.baseUrl}/${id}/deactivate`, {}, { headers }).pipe(map((row) => this.adapt(row)));
  }

  publicarVersion(versionId: string, lockVersion: number, reason: string): Observable<unknown> {
    return this.http.post(`${this.apiConfig.baseUrl}/product-versions/${versionId}/publish`, { lock_version: lockVersion, reason });
  }

  private adapt(row: any): ProductDto {
    const version = [...(row.versions ?? [])].sort((a: any, b: any) => b.version - a.version)[0] ?? row;
    return { id: row.id, version_id: version.id ?? '', code: row.code, name: version.name ?? row.code, description: version.description ?? null,
      status: row.status, nominal_amount: version.nominal_amount ?? '0', version_status: version.status ?? 'DRAFT', effective_from: version.effective_from ?? '',
      reason: version.reason ?? '', created_at: row.created_at, lock_version: version.lock_version ?? row.lock_version ?? 0,
      loan_commission_percentage: version.loan_commission_percentage ?? row.loan_commission_percentage ?? null,
      simple_interest_percentage: version.simple_interest_percentage ?? row.simple_interest_percentage ?? null,
      insurance_amount: version.insurance_amount ?? row.insurance_amount ?? null,
      fortnights_count: version.fortnights_count ?? row.fortnights_count ?? null,
      late_fee_amount: version.late_fee_amount ?? row.late_fee_amount ?? null,
    };
  }
}
