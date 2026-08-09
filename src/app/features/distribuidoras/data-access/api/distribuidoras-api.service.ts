import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Distribuidora } from '../../models/distribuidora.model';
import { CategoriaDistribuidora } from '../../models/categoria-distribuidora.model';
import { FiltroDistribuidoras } from '../../models/filtro-distribuidoras.model';
import { DistribuidoraMapper } from '../mappers/distribuidora.mapper';
import { DistributorDetailResponseDto } from '../dtos/distributor-detail-response.dto';
import { AssignDistributorCategoryRequestDto } from '../dtos/assign-distributor-category-request.dto';
import { ResendDistributorInvitationRequestDto } from '../dtos/resend-distributor-invitation-request.dto';

interface Pagina<T> { datos: T[]; paginaActiva: number; ultimaPagina: number; porPagina: number; total: number; }
export interface CandidatoActivacion {
  id: string; applicant_name: string;
  branch: { id: string; name: string };
  coordinator: { id: string; name: string };
  authorization: { id: string; decision: 'AUTORIZADA'; authorized_at: string };
}
export interface CategoriaDisponible {
  category_id: string; category_version_id: string; code: string; name: string; description: string | null;
}

@Injectable({ providedIn: 'root' })
export class DistribuidorasApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/distributors';

  listar(pagina = 1, porPagina = 10, filtros?: FiltroDistribuidoras): Observable<Pagina<Distribuidora>> {
    let params = new HttpParams().set('page', pagina).set('per_page', porPagina);
    Object.entries(filtros ?? {}).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value)); });
    return this.http.get<any>(this.apiUrl, { params }).pipe(map(response => ({
      datos: DistribuidoraMapper.fromDtoList(response.data), paginaActiva: response.meta.current_page,
      ultimaPagina: response.meta.last_page, porPagina: response.meta.per_page, total: response.meta.total
    })));
  }

  obtener(id: string): Observable<Distribuidora> {
    return this.http.get<{ data: DistributorDetailResponseDto }>(`${this.apiUrl}/${id}`).pipe(map(response => DistribuidoraMapper.fromDto(response.data)));
  }

  candidatosActivacion(): Observable<CandidatoActivacion[]> {
    return this.http.get<{ data: CandidatoActivacion[] }>('/api/v1/distributor-activation-candidates').pipe(map(response => response.data));
  }

  categoriasDisponibles(): Observable<CategoriaDisponible[]> {
    return this.http.get<{ data: CategoriaDisponible[] }>('/api/v1/distributor-categories/available').pipe(map(response => response.data));
  }

  activarSolicitud(solicitudId: string, categoryVersionId: string): Observable<Distribuidora> {
    return this.http.post<{ data: DistributorDetailResponseDto }>(`/api/v1/distributor-applications/${solicitudId}/activation`,
      { category_version_id: categoryVersionId }, { headers: { 'Idempotency-Key': crypto.randomUUID() } })
      .pipe(map(response => DistribuidoraMapper.fromDto(response.data)));
  }

  asignarCategoria(distribuidoraId: string, versionBloqueo: number, entrada: AssignDistributorCategoryRequestDto): Observable<CategoriaDistribuidora> {
    return this.http.post<any>(`${this.apiUrl}/${distribuidoraId}/category-assignments`, { ...entrada, lock_version: versionBloqueo })
      .pipe(map(response => DistribuidoraMapper.mapCategoria(response.data)));
  }

  obtenerHistorialCategorias(distribuidoraId: string): Observable<CategoriaDistribuidora[]> {
    return this.http.get<any>(`${this.apiUrl}/${distribuidoraId}/category-assignments`).pipe(map(response => response.data.map((dto: any) => DistribuidoraMapper.mapCategoria(dto))));
  }

  reenviarInvitacion(distribuidoraId: string, entrada: ResendDistributorInvitationRequestDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${distribuidoraId}/activation-invitations/resend`, entrada);
  }
}
