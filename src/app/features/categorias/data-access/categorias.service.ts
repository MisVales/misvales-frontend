import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api/api.config';
import { Observable } from 'rxjs';
import { CategoriaReq, CategoriaRes } from '../../../core/api/models/catalogos.dtos';
import { PaginationMeta } from '../../../core/api/models/api.dtos';

@Injectable({
  providedIn: 'root',
})
export class CategoriasService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly baseUrl = `${this.config.baseUrl}/categorias`;

  listar(filtros: any, page: number): Observable<{ data: CategoriaRes[]; meta: PaginationMeta }> {
    let params = new HttpParams().set('page', page.toString());
    if (filtros.nombre) params = params.set('nombre', filtros.nombre);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.vigencia) params = params.set('vigencia', filtros.vigencia);

    return this.http.get<{ data: CategoriaRes[]; meta: PaginationMeta }>(this.baseUrl, { params });
  }

  consultar(id: string): Observable<CategoriaRes> {
    return this.http.get<CategoriaRes>(`${this.baseUrl}/${id}`);
  }

  crear(req: CategoriaReq): Observable<CategoriaRes> {
    return this.http.post<CategoriaRes>(this.baseUrl, req);
  }

  modificarBorrador(id: string, req: CategoriaReq, lockVersion?: string): Observable<CategoriaRes> {
    const headers: any = {};
    if (lockVersion) headers['If-Match'] = lockVersion;
    return this.http.put<CategoriaRes>(`${this.baseUrl}/${id}/borrador`, req, { headers });
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
