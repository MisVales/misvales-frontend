import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api/api.config';
import { Observable } from 'rxjs';
import { ProductoReq, ProductoRes } from '../../../core/api/models/catalogos.dtos';
import { PaginationMeta } from '../../../core/api/models/api.dtos';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly baseUrl = `${this.config.baseUrl}/productos`;

  listar(filtros: any, page: number): Observable<{ data: ProductoRes[]; meta: PaginationMeta }> {
    let params = new HttpParams().set('page', page.toString());
    if (filtros.nombre) params = params.set('nombre', filtros.nombre);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.vigencia) params = params.set('vigencia', filtros.vigencia);
    if (filtros.montoNominal) params = params.set('montoNominal', filtros.montoNominal);

    return this.http.get<{ data: ProductoRes[]; meta: PaginationMeta }>(this.baseUrl, { params });
  }

  consultar(id: string): Observable<ProductoRes> {
    return this.http.get<ProductoRes>(`${this.baseUrl}/${id}`);
  }

  crear(req: ProductoReq): Observable<ProductoRes> {
    return this.http.post<ProductoRes>(this.baseUrl, req);
  }

  modificarBorrador(id: string, req: ProductoReq, lockVersion?: string): Observable<ProductoRes> {
    const headers: any = {};
    if (lockVersion) headers['If-Match'] = lockVersion;
    return this.http.put<ProductoRes>(`${this.baseUrl}/${id}/borrador`, req, { headers });
  }

  publicar(id: string, lockVersion?: string): Observable<void> {
    const headers: any = {};
    if (lockVersion) headers['If-Match'] = lockVersion;
    return this.http.post<void>(`${this.baseUrl}/${id}/publicar`, {}, { headers });
  }

  desactivar(id: string, lockVersion?: string): Observable<void> {
    const headers: any = {};
    if (lockVersion) headers['If-Match'] = lockVersion;
    return this.http.post<void>(`${this.baseUrl}/${id}/desactivar`, {}, { headers });
  }
}
