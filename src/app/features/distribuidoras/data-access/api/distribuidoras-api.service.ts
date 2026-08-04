import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Distribuidora } from '../../models/distribuidora.model';
import { CategoriaDistribuidora } from '../../models/categoria-distribuidora.model';
import { FiltroDistribuidoras } from '../../models/filtro-distribuidoras.model';
import { DistribuidoraMapper } from '../mappers/distribuidora.mapper';
import { DistributorListItemResponseDto } from '../dtos/distributor-list-item-response.dto';
import { DistributorDetailResponseDto } from '../dtos/distributor-detail-response.dto';
import { AssignDistributorCategoryRequestDto } from '../dtos/assign-distributor-category-request.dto';
import { ActivateDistributorRequestDto } from '../dtos/activate-distributor-request.dto';
import { ResendDistributorInvitationRequestDto } from '../dtos/resend-distributor-invitation-request.dto';

interface Pagina<T> {
  datos: T[];
  paginaActiva: number;
  ultimaPagina: number;
  porPagina: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class DistribuidorasApiService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/distributors';

  listar(pagina: number = 1, porPagina: number = 10, filtros?: FiltroDistribuidoras): Observable<Pagina<Distribuidora>> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('per_page', porPagina.toString());

    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params = params.set(key, value);
      });
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(res => ({
        datos: DistribuidoraMapper.fromDtoList(res.data),
        paginaActiva: res.meta.current_page,
        ultimaPagina: res.meta.last_page,
        porPagina: res.meta.per_page,
        total: res.meta.total
      }))
    );
  }

  obtener(id: string): Observable<Distribuidora> {
    return this.http.get<DistributorDetailResponseDto>(`${this.apiUrl}/${id}`).pipe(
      map(dto => DistribuidoraMapper.fromDto(dto))
    );
  }

  activarSolicitud(solicitudId: string, versionBloqueo: number): Observable<Distribuidora> {
    // Activa la solicitud autorizada en manager decision. Ruta según documento:
    // POST /api/v1/distributor-applications/{id}/activation
    const payload: ActivateDistributorRequestDto = { lock_version: versionBloqueo };
    return this.http.post<DistributorDetailResponseDto>(`/api/v1/distributor-applications/${solicitudId}/activation`, payload).pipe(
      map(dto => DistribuidoraMapper.fromDto(dto))
    );
  }

  asignarCategoria(distribuidoraId: string, versionBloqueo: number, entrada: AssignDistributorCategoryRequestDto): Observable<CategoriaDistribuidora> {
    return this.http.post<any>(`${this.apiUrl}/${distribuidoraId}/category-assignments`, entrada, {
      headers: { 'If-Match': `"${versionBloqueo}"` } // Assuming ETag pattern or sending lock_version in body if requested, but body doesn't strictly have lock_version in the request DTO. I'll send it in If-Match as per doc "Enviar If-Match o lock_version al cambiar categoría".
    }).pipe(
      map(dto => DistribuidoraMapper.mapCategoria(dto.data))
    );
  }

  obtenerHistorialCategorias(distribuidoraId: string): Observable<CategoriaDistribuidora[]> {
    return this.http.get<any>(`${this.apiUrl}/${distribuidoraId}/category-assignments`).pipe(
      map(res => res.data.map((dto: any) => DistribuidoraMapper.mapCategoria(dto)))
    );
  }

  reenviarInvitacion(distribuidoraId: string, entrada: ResendDistributorInvitationRequestDto): Observable<void> {
    // POST /api/v1/distributors/{id}/activation-invitations/resend
    return this.http.post<void>(`${this.apiUrl}/${distribuidoraId}/activation-invitations/resend`, entrada);
  }
}
