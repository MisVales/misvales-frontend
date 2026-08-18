import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { API_CONFIG } from '../../../core/api/api.config';
import { PaginacionResponseDTO, SolicitudDistribuidoraResponseDTO } from './dtos/solicitud-distribuidora-response.dto';
import { CrearSolicitudRequestDTO } from './dtos/solicitud-distribuidora-request.dto';
import { SolicitudDistribuidoraMapper } from './mappers/solicitud-distribuidora.mapper';
import { PaginacionRespuesta, SolicitudDistribuidora } from '../models/solicitud-distribuidora.model';

function unwrapArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  console.warn('unwrapArray: unexpected response shape', res);
  return [];
}

function unwrapData<T>(res: T | { data: T }): T {
  return res && typeof res === 'object' && 'data' in res ? (res as { data: T }).data : res as T;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudesDistribuidoraApiService {
  private http = inject(HttpClient);
  private apiConfig = inject(API_CONFIG);

  private get baseUrl() {
    return `${this.apiConfig.baseUrl}/distributor-applications`;
  }

  private withLockVersion<T extends Record<string, any>>(payload: T, versionBloqueo: number): T & { lock_version: number } {
    return {
      ...payload,
      lock_version: versionBloqueo,
    };
  }

  private autosaveOptions() {
    return { headers: new HttpHeaders().set('X-Autosave', 'true') };
  }

  // ==== 1. SOLICITUD PRINCIPAL ====
  
  listarSolicitudes(
    pagina: number = 1, 
    porPagina: number = 10,
    filtros?: Record<string, string>
  ): Observable<PaginacionRespuesta<SolicitudDistribuidora>> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('per_page', porPagina.toString());
      
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          params = params.set(key, filtros[key]);
        }
      });
    }

    return this.http.get<PaginacionResponseDTO<SolicitudDistribuidoraResponseDTO>>(this.baseUrl, { params }).pipe(
      map(res => SolicitudDistribuidoraMapper.mapToPaginationModel(res, SolicitudDistribuidoraMapper.mapToModel))
    );
  }

  crearSolicitud(datos: CrearSolicitudRequestDTO): Observable<SolicitudDistribuidora> {
    return this.http.post<SolicitudDistribuidoraResponseDTO | { data: SolicitudDistribuidoraResponseDTO }>(this.baseUrl, datos).pipe(
      map(unwrapData), map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  consultarSolicitud(id: string): Observable<SolicitudDistribuidora> {
    return this.http.get<SolicitudDistribuidoraResponseDTO | { data: SolicitudDistribuidoraResponseDTO }>(`${this.baseUrl}/${id}`).pipe(
      map(unwrapData), map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  enviarARevision(id: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    return this.http.post<SolicitudDistribuidoraResponseDTO | { data: SolicitudDistribuidoraResponseDTO }>(`${this.baseUrl}/${id}/submit`, { lock_version: versionBloqueo }).pipe(
      map(unwrapData), map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  // ==== 2. DATOS PERSONALES ====

  guardarDatosPersonales(id: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    return this.http.put(
      `${this.baseUrl}/${id}/personal-data`,
      this.withLockVersion(datos, versionBloqueo),
      this.autosaveOptions(),
    ).pipe(
      switchMap(() => this.consultarSolicitud(id))
    );
  }

  // ==== 3. REFERENCIAS FAMILIARES ====

  listarFamiliares(idSolicitud: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/${idSolicitud}/family-members`).pipe(map(unwrapArray));
  }

  crearFamiliar(idSolicitud: string, datos: any, versionBloqueo: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${idSolicitud}/family-members`, this.withLockVersion(datos, versionBloqueo), this.autosaveOptions()).pipe(
      map(unwrapData),
    );
  }

  actualizarFamiliar(idSolicitud: string, idFamiliar: string, datos: any, versionBloqueo: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${idSolicitud}/family-members/${idFamiliar}`, this.withLockVersion(datos, versionBloqueo), this.autosaveOptions()).pipe(
      map(unwrapData),
    );
  }

  eliminarFamiliar(idSolicitud: string, idFamiliar: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    return this.http.delete<any>(`${this.baseUrl}/${idSolicitud}/family-members/${idFamiliar}`, {
      body: { lock_version: versionBloqueo },
    });
  }

  // ==== DOMICILIOS ====
  listarDomicilios(idSolicitud: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/${idSolicitud}/residences`).pipe(map(unwrapArray));
  }

  crearDomicilio(idSolicitud: string, datos: any, versionBloqueo: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${idSolicitud}/residences`, this.withLockVersion(datos, versionBloqueo), this.autosaveOptions()).pipe(map(unwrapData));
  }

  actualizarDomicilio(idSolicitud: string, idDomicilio: string, datos: any, versionBloqueo: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${idSolicitud}/residences/${idDomicilio}`, this.withLockVersion(datos, versionBloqueo), this.autosaveOptions()).pipe(map(unwrapData));
  }

  eliminarDomicilio(idSolicitud: string, idDomicilio: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    return this.http.delete<any>(`${this.baseUrl}/${idSolicitud}/residences/${idDomicilio}`, {
      body: { lock_version: versionBloqueo },
    });
  }

  // ==== VEHÍCULOS ====
  listarVehiculos(idSolicitud: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/${idSolicitud}/vehicles`).pipe(map(unwrapArray));
  }

  crearVehiculo(idSolicitud: string, datos: any, versionBloqueo: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${idSolicitud}/vehicles`, this.withLockVersion(datos, versionBloqueo), this.autosaveOptions()).pipe(map(unwrapData));
  }

  actualizarVehiculo(idSolicitud: string, idVehiculo: string, datos: any, versionBloqueo: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${idSolicitud}/vehicles/${idVehiculo}`, this.withLockVersion(datos, versionBloqueo), this.autosaveOptions()).pipe(map(unwrapData));
  }

  eliminarVehiculo(idSolicitud: string, idVehiculo: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    return this.http.delete<any>(`${this.baseUrl}/${idSolicitud}/vehicles/${idVehiculo}`, {
      body: { lock_version: versionBloqueo },
    });
  }

  // ==== BIENES Y COMPROMISOS ====
  listarPatrimonio(idSolicitud: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/${idSolicitud}/assets-liabilities`).pipe(map(unwrapArray));
  }

  crearPatrimonio(idSolicitud: string, datos: any, versionBloqueo: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${idSolicitud}/assets-liabilities`, this.withLockVersion(datos, versionBloqueo), this.autosaveOptions()).pipe(map(unwrapData));
  }

  actualizarPatrimonio(idSolicitud: string, idPatrimonio: string, datos: any, versionBloqueo: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${idSolicitud}/assets-liabilities/${idPatrimonio}`, this.withLockVersion(datos, versionBloqueo), this.autosaveOptions()).pipe(map(unwrapData));
  }

  eliminarPatrimonio(idSolicitud: string, idPatrimonio: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    return this.http.delete<any>(`${this.baseUrl}/${idSolicitud}/assets-liabilities/${idPatrimonio}`, {
      body: { lock_version: versionBloqueo },
    });
  }

  // ==== EMPLEOS ====
  listarEmpleos(idSolicitud: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/${idSolicitud}/employments`).pipe(map(unwrapArray));
  }

  crearEmpleo(idSolicitud: string, datos: any, versionBloqueo: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${idSolicitud}/employments`, this.withLockVersion(datos, versionBloqueo), this.autosaveOptions()).pipe(map(unwrapData));
  }

  actualizarEmpleo(idSolicitud: string, idEmpleo: string, datos: any, versionBloqueo: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${idSolicitud}/employments/${idEmpleo}`, this.withLockVersion(datos, versionBloqueo), this.autosaveOptions()).pipe(map(unwrapData));
  }

  eliminarEmpleo(idSolicitud: string, idEmpleo: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    return this.http.delete<any>(`${this.baseUrl}/${idSolicitud}/employments/${idEmpleo}`, {
      body: { lock_version: versionBloqueo },
    });
  }

  // ==== CRÉDITOS COMERCIALES ====
  listarCreditosComerciales(idSolicitud: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/${idSolicitud}/commercial-credits`).pipe(map(unwrapArray));
  }

  crearCreditoComercial(idSolicitud: string, datos: any, versionBloqueo: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${idSolicitud}/commercial-credits`, this.withLockVersion(datos, versionBloqueo), this.autosaveOptions()).pipe(map(unwrapData));
  }

  actualizarCreditoComercial(idSolicitud: string, idCredito: string, datos: any, versionBloqueo: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${idSolicitud}/commercial-credits/${idCredito}`, this.withLockVersion(datos, versionBloqueo), this.autosaveOptions()).pipe(map(unwrapData));
  }

  eliminarCreditoComercial(idSolicitud: string, idCredito: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    return this.http.delete<any>(`${this.baseUrl}/${idSolicitud}/commercial-credits/${idCredito}`, {
      body: { lock_version: versionBloqueo },
    });
  }

}
