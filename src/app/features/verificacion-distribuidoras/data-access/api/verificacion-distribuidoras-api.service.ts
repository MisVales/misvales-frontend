import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, filter, map } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';
import { 
  ActualizarVisitaRequestDto, 
  AplicarCorreccionRequestDto, 
  AsignarVerificadorRequestDto, 
  AutorizarSolicitudRequestDto, 
  DevolverSolicitudCapturaRequestDto, 
  EvaluarSolicitudRequestDto, 
  FinalizarCorreccionesRequestDto, 
  FinalizarVisitaRequestDto, 
  IniciarVisitaRequestDto,
  SolicitudDistribuidoraResponseDto,
  VisitaVerificacionResponseDto,
  EvidenciaVerificacionResponseDto
} from '../dtos/verificacion-distribuidoras.dtos';

@Injectable({
  providedIn: 'root'
})
export class VerificacionDistribuidorasApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}`;

  // ---------------------------------------------------------
  // SOLICITUDES
  // ---------------------------------------------------------
  
  listarSolicitudes(params?: { page?: number; perPage?: number; status?: string; search?: string }): Observable<{ data: SolicitudDistribuidoraResponseDto[], total: number, page: number, perPage: number }> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.perPage) httpParams = httpParams.set('per_page', params.perPage);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<{ data: SolicitudDistribuidoraResponseDto[], meta: any }>(`${this.apiUrl}/distributor-applications`, { params: httpParams }).pipe(
      map(res => ({
        data: res.data,
        total: res.meta.total,
        page: res.meta.current_page,
        perPage: res.meta.per_page
      }))
    );
  }

  consultarSolicitud(id: string): Observable<SolicitudDistribuidoraResponseDto> {
    return this.http.get<{ data: SolicitudDistribuidoraResponseDto }>(`${this.apiUrl}/distributor-applications/${id}`).pipe(map(res => res.data));
  }

  devolverACaptura(id: string, req: DevolverSolicitudCapturaRequestDto): Observable<SolicitudDistribuidoraResponseDto> {
    return this.http.post<{ data: SolicitudDistribuidoraResponseDto }>(`${this.apiUrl}/distributor-applications/${id}/return-to-capture`, req).pipe(map(res => res.data));
  }

  asignarVerificador(id: string, req: AsignarVerificadorRequestDto): Observable<SolicitudDistribuidoraResponseDto> {
    return this.http.post<{ data: SolicitudDistribuidoraResponseDto }>(`${this.apiUrl}/distributor-applications/${id}/assign-verifier`, req).pipe(map(res => res.data));
  }

  listarVerificadoresDisponibles(): Observable<{ id: string; nombre_completo: string; sucursal_id: string; estado: string }[]> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/users?role=VERIFIER`).pipe(map(res => res.data)); // Ajustar si hay un endpoint específico
  }

  // ---------------------------------------------------------
  // VISITAS Y EVIDENCIAS
  // ---------------------------------------------------------

  listarVisitasAsignadas(params?: { page?: number; perPage?: number; status?: string; search?: string }): Observable<{ data: VisitaVerificacionResponseDto[], total: number, page: number, perPage: number }> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.perPage) httpParams = httpParams.set('per_page', params.perPage);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    // Assuming a specific endpoint for the verifier's assigned visits
    return this.http.get<{ data: VisitaVerificacionResponseDto[], meta: any }>(`${this.apiUrl}/verification-visits/assigned`, { params: httpParams }).pipe(
      map(res => ({
        data: res.data,
        total: res.meta?.total || res.data.length,
        page: res.meta?.current_page || 1,
        perPage: res.meta?.per_page || res.data.length
      }))
    );
  }

  consultarVisita(id: string): Observable<VisitaVerificacionResponseDto> {
    return this.http.get<{ data: VisitaVerificacionResponseDto }>(`${this.apiUrl}/verification-visits/${id}`).pipe(map(res => res.data));
  }

  iniciarVisita(id: string, req: IniciarVisitaRequestDto): Observable<VisitaVerificacionResponseDto> {
    return this.http.post<{ data: VisitaVerificacionResponseDto }>(`${this.apiUrl}/verification-visits/${id}/start`, req).pipe(map(res => res.data));
  }

  actualizarVisita(id: string, req: ActualizarVisitaRequestDto): Observable<VisitaVerificacionResponseDto> {
    return this.http.put<{ data: VisitaVerificacionResponseDto }>(`${this.apiUrl}/verification-visits/${id}`, req).pipe(map(res => res.data));
  }

  finalizarVisita(id: string, req: FinalizarVisitaRequestDto): Observable<VisitaVerificacionResponseDto> {
    return this.http.post<{ data: VisitaVerificacionResponseDto }>(`${this.apiUrl}/verification-visits/${id}/finish`, req).pipe(map(res => res.data));
  }

  adjuntarEvidencia(visitaId: string, tipo: string, file: File, lockVersion: number): Observable<{ progress: number; data?: EvidenciaVerificacionResponseDto }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);
    formData.append('lock_version', lockVersion.toString());

    return this.http.post<{ data: EvidenciaVerificacionResponseDto }>(
      `${this.apiUrl}/verification-visits/${visitaId}/evidences`, 
      formData,
      { reportProgress: true, observe: 'events' }
    ).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          return { progress: Math.round(100 * event.loaded / event.total) };
        } else if (event.type === HttpEventType.Response) {
          return { progress: 100, data: event.body.data };
        }
        return { progress: 0 };
      })
    );
  }

  descargarEvidencia(visitaId: string, evidenciaId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/verification-visits/${visitaId}/evidences/${evidenciaId}/download`, { responseType: 'blob' });
  }

  eliminarEvidencia(visitaId: string, evidenciaId: string, lockVersion: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/verification-visits/${visitaId}/evidences/${evidenciaId}`, {
      body: { lock_version: lockVersion }
    });
  }

  // ---------------------------------------------------------
  // CORRECCIONES, EVALUACION Y AUTORIZACION
  // ---------------------------------------------------------

  aplicarCorreccion(solicitudId: string, req: AplicarCorreccionRequestDto): Observable<SolicitudDistribuidoraResponseDto> {
    return this.http.post<{ data: SolicitudDistribuidoraResponseDto }>(`${this.apiUrl}/distributor-applications/${solicitudId}/corrections`, req).pipe(map(res => res.data));
  }

  finalizarCorrecciones(solicitudId: string, req: FinalizarCorreccionesRequestDto): Observable<SolicitudDistribuidoraResponseDto> {
    return this.http.post<{ data: SolicitudDistribuidoraResponseDto }>(`${this.apiUrl}/distributor-applications/${solicitudId}/corrections/finish`, req).pipe(map(res => res.data));
  }

  evaluarSolicitud(solicitudId: string, req: EvaluarSolicitudRequestDto): Observable<SolicitudDistribuidoraResponseDto> {
    return this.http.post<{ data: SolicitudDistribuidoraResponseDto }>(`${this.apiUrl}/distributor-applications/${solicitudId}/evaluate`, req).pipe(map(res => res.data));
  }

  autorizarSolicitud(solicitudId: string, req: AutorizarSolicitudRequestDto): Observable<SolicitudDistribuidoraResponseDto> {
    return this.http.post<{ data: SolicitudDistribuidoraResponseDto }>(`${this.apiUrl}/distributor-applications/${solicitudId}/authorize`, req).pipe(map(res => res.data));
  }
}
