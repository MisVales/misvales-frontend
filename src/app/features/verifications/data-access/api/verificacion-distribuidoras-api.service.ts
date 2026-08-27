import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, filter, map } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';
import {
  ActualizarVisitaRequestDto,
  AplicarCorreccionRequestDto,
  AsignarVerificadorRequestDto,
  AgendaVerificadorDto,
  AutorizarSolicitudRequestDto,
  DevolverSolicitudCapturaRequestDto,
  EvaluarSolicitudRequestDto,
  FinalizarCorreccionesRequestDto,
  FinalizarVisitaRequestDto,
  IniciarVisitaRequestDto,
  SolicitudDistribuidoraResponseDto,
  VisitaVerificacionResponseDto,
  EvidenciaVerificacionResponseDto,
} from '../dtos/verificacion-distribuidoras.dtos';

@Injectable({
  providedIn: 'root',
})
export class VerificacionDistribuidorasApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly apiUrl = `${this.apiConfig.baseUrl}`;

  // ---------------------------------------------------------
  // SOLICITUDES
  // ---------------------------------------------------------

  listarSolicitudes(params?: {
    page?: number;
    perPage?: number;
    status?: string;
    search?: string;
  }): Observable<{
    data: SolicitudDistribuidoraResponseDto[];
    total: number;
    page: number;
    perPage: number;
  }> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.perPage) httpParams = httpParams.set('per_page', params.perPage);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http
      .get<{ data: SolicitudDistribuidoraResponseDto[]; meta: any }>(
        `${this.apiUrl}/distributor-applications`,
        { params: httpParams },
      )
      .pipe(
        map((res) => ({
          data: res.data,
          total: res.meta.total,
          page: res.meta.current_page,
          perPage: res.meta.per_page,
        })),
      );
  }

  consultarSolicitud(id: string): Observable<SolicitudDistribuidoraResponseDto> {
    return this.http
      .get<{ data: SolicitudDistribuidoraResponseDto }>(
        `${this.apiUrl}/distributor-applications/${id}`,
      )
      .pipe(map((res) => res.data));
  }

  devolverACaptura(id: string, req: DevolverSolicitudCapturaRequestDto): Observable<void> {
    return this.http
      .post(`${this.apiUrl}/distributor-applications/${id}/return-to-draft`, {
        reason: req.motivo,
        pending_sections: req.seccionesPendientes,
        lock_version: req.lock_version,
      })
      .pipe(map(() => undefined));
  }

  asignarVerificador(id: string, req: AsignarVerificadorRequestDto): Observable<void> {
    return this.http
      .post(`${this.apiUrl}/distributor-applications/${id}/assign-verifier`, req)
      .pipe(map(() => undefined));
  }

  listarVerificadoresDisponibles(
    applicationId: string,
  ): Observable<{ id: string; nombre_completo: string; sucursal_id: string; estado: string }[]> {
    return this.http
      .get<{ data: any[] }>(
        `${this.apiUrl}/distributor-applications/${applicationId}/available-verifiers`,
      )
      .pipe(
        map((res) =>
          res.data.map((user) => ({
            id: user.id,
            nombre_completo: user.name,
            sucursal_id: user.branch_id,
            estado: user.state,
          })),
        ),
      );
  }

  consultarAgendaVerificador(
    applicationId: string,
    verifierId: string,
    from: string,
    to: string,
  ): Observable<AgendaVerificadorDto[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http
      .get<{ data: AgendaVerificadorDto[] }>(
        `${this.apiUrl}/distributor-applications/${applicationId}/verifiers/${verifierId}/schedule`,
        { params },
      )
      .pipe(map((response) => response.data));
  }

  consultarPoliticaHorario(): Observable<{
    start_time: string;
    max_start_time: string;
    timezone: string;
    slot_minutes: number;
  }> {
    return this.http
      .get<{ data: { start_time: string; max_start_time: string; timezone: string; slot_minutes: number } }>(
        `${this.apiUrl}/verification-schedule-policy`,
      )
      .pipe(map((response) => response.data));
  }

  // ---------------------------------------------------------
  // VISITAS Y EVIDENCIAS
  // ---------------------------------------------------------

  listarVisitasAsignadas(params?: {
    page?: number;
    perPage?: number;
    status?: string;
    search?: string;
  }): Observable<{
    data: VisitaVerificacionResponseDto[];
    total: number;
    page: number;
    perPage: number;
  }> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.perPage) httpParams = httpParams.set('per_page', params.perPage);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    // Assuming a specific endpoint for the verifier's assigned visits
    return this.http
      .get<{ data: VisitaVerificacionResponseDto[]; meta: any }>(
        `${this.apiUrl}/verification-visits/assigned`,
        { params: httpParams },
      )
      .pipe(
        map((res) => ({
          data: res.data,
          total: res.meta?.total || res.data.length,
          page: res.meta?.current_page || 1,
          perPage: res.meta?.per_page || res.data.length,
        })),
      );
  }

  consultarVisita(id: string): Observable<VisitaVerificacionResponseDto> {
    return this.http
      .get<{ data: VisitaVerificacionResponseDto }>(`${this.apiUrl}/verification-visits/${id}`)
      .pipe(map((res) => res.data));
  }

  iniciarVisita(
    id: string,
    req: IniciarVisitaRequestDto,
  ): Observable<VisitaVerificacionResponseDto> {
    return this.http
      .post<{ data: VisitaVerificacionResponseDto }>(
        `${this.apiUrl}/verification-visits/${id}/start`,
        req,
      )
      .pipe(map((res) => res.data));
  }

  actualizarVisita(id: string, req: ActualizarVisitaRequestDto): Observable<void> {
    const items = (req.diferencias || []).map((d) => ({
      section: d.seccion,
      field: d.campo,
      declared_value: d.dato_declarado,
      observed_value: d.dato_observado,
      description: d.descripcion,
      record_id: d.registro_id,
      record_label: d.registro_nombre,
    }));
    return this.http
      .put(`${this.apiUrl}/verification-visits/${id}/differences`, {
        differences_payload: { has_differences: items.length > 0, items },
        lock_version: req.lock_version,
      })
      .pipe(map(() => undefined));
  }

  finalizarVisita(id: string, req: FinalizarVisitaRequestDto): Observable<void> {
    return this.http
      .post(`${this.apiUrl}/verification-visits/${id}/finish`, {
        result: req.resultado_fisico,
        observations: req.observaciones,
        lock_version: req.lock_version,
      })
      .pipe(map(() => undefined));
  }

  adjuntarEvidencia(
    visitaId: string,
    tipo: string,
    file: File,
    lockVersion: number,
  ): Observable<{ progress: number; data?: EvidenciaVerificacionResponseDto }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', tipo);
    formData.append('lock_version', lockVersion.toString());

    return this.http
      .post<{ data: EvidenciaVerificacionResponseDto }>(
        `${this.apiUrl}/verification-visits/${visitaId}/evidences`,
        formData,
        { reportProgress: true, observe: 'events' },
      )
      .pipe(
        map((event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            return { progress: Math.round((100 * event.loaded) / event.total) };
          } else if (event.type === HttpEventType.Response) {
            return { progress: 100, data: event.body.data };
          }
          return { progress: 0 };
        }),
      );
  }

  descargarEvidencia(visitaId: string, evidenciaId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/verification-evidences/${evidenciaId}/download`, {
      responseType: 'blob',
    });
  }

  eliminarEvidencia(visitaId: string, evidenciaId: string, lockVersion: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/verification-evidences/${evidenciaId}`, {
      body: { lock_version: lockVersion },
    });
  }

  // ---------------------------------------------------------
  // CORRECCIONES, EVALUACION Y AUTORIZACION
  // ---------------------------------------------------------

  aplicarCorreccion(solicitudId: string, req: AplicarCorreccionRequestDto): Observable<void> {
    return this.http
      .post(`${this.apiUrl}/distributor-applications/${solicitudId}/corrections`, {
        visit_id: req.visit_id,
        section: req.seccion,
        field_path: req.campo,
        lock_version: req.lock_version,
        record_id: req.record_id,
        difference_index: req.difference_index,
      })
      .pipe(map(() => undefined));
  }

  finalizarCorrecciones(
    solicitudId: string,
    req: FinalizarCorreccionesRequestDto,
  ): Observable<void> {
    return this.http
      .post(`${this.apiUrl}/distributor-applications/${solicitudId}/corrections/finish`, req)
      .pipe(map(() => undefined));
  }

  evaluarSolicitud(solicitudId: string, req: EvaluarSolicitudRequestDto): Observable<void> {
    return this.http
      .post(`${this.apiUrl}/distributor-applications/${solicitudId}/evaluate`, {
        visit_id: req.visit_id,
        result: req.dictamen,
        reason: req.motivo,
        lock_version: req.lock_version,
      })
      .pipe(map(() => undefined));
  }

  autorizarSolicitud(solicitudId: string, req: AutorizarSolicitudRequestDto): Observable<void> {
    return this.http
      .post(`${this.apiUrl}/distributor-applications/${solicitudId}/authorize`, {
        decision: req.decision,
        reason: req.motivo,
        initial_credit_line_amount: req.linea_inicial,
        lock_version: req.lock_version,
      })
      .pipe(map(() => undefined));
  }
}
