import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_CONFIG } from '../../../core/api/api.config';
import { PaginacionResponseDTO, SolicitudDistribuidoraResponseDTO } from './dtos/solicitud-distribuidora-response.dto';
import { CrearSolicitudRequestDTO } from './dtos/solicitud-distribuidora-request.dto';
import { SolicitudDistribuidoraMapper } from './mappers/solicitud-distribuidora.mapper';
import { PaginacionRespuesta, SolicitudDistribuidora } from '../models/solicitud-distribuidora.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesDistribuidoraApiService {
  private http = inject(HttpClient);
  private apiConfig = inject(API_CONFIG);

  private get baseUrl() {
    return `${this.apiConfig.baseUrl}/distributor-applications`;
  }

  // ==== 1. SOLICITUD PRINCIPAL ====
  
  listarSolicitudes(
    pagina: number = 1, 
    porPagina: number = 10,
    filtros?: Record<string, string>
  ): Observable<PaginacionRespuesta<SolicitudDistribuidora>> {
    let params = new HttpParams()
      .set('page', pagina.toString())
      .set('perPage', porPagina.toString());
      
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
    return this.http.post<SolicitudDistribuidoraResponseDTO>(this.baseUrl, datos).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  consultarSolicitud(id: string): Observable<SolicitudDistribuidora> {
    return this.http.get<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${id}`).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  enviarARevision(id: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.post<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${id}/submit`, {}, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  // ==== 2. DATOS PERSONALES ====

  guardarDatosPersonales(id: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.put<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${id}/personal-data`, datos, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  // ==== 3. REFERENCIAS FAMILIARES ====

  listarFamiliares(idSolicitud: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${idSolicitud}/family-members`);
  }

  crearFamiliar(idSolicitud: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.post<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/family-members`, datos, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  actualizarFamiliar(idSolicitud: string, idFamiliar: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.patch<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/family-members/${idFamiliar}`, datos, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  eliminarFamiliar(idSolicitud: string, idFamiliar: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.delete<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/family-members/${idFamiliar}`, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  // ==== DOMICILIOS ====
  listarDomicilios(idSolicitud: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${idSolicitud}/residences`);
  }

  crearDomicilio(idSolicitud: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.post<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/residences`, datos, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  actualizarDomicilio(idSolicitud: string, idDomicilio: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.patch<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/residences/${idDomicilio}`, datos, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  eliminarDomicilio(idSolicitud: string, idDomicilio: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.delete<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/residences/${idDomicilio}`, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  // ==== VEHÍCULOS ====
  listarVehiculos(idSolicitud: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${idSolicitud}/vehicles`);
  }

  crearVehiculo(idSolicitud: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.post<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/vehicles`, datos, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  actualizarVehiculo(idSolicitud: string, idVehiculo: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.patch<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/vehicles/${idVehiculo}`, datos, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  eliminarVehiculo(idSolicitud: string, idVehiculo: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.delete<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/vehicles/${idVehiculo}`, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  // ==== BIENES Y COMPROMISOS ====
  listarPatrimonio(idSolicitud: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${idSolicitud}/assets-liabilities`);
  }

  crearPatrimonio(idSolicitud: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.post<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/assets-liabilities`, datos, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  actualizarPatrimonio(idSolicitud: string, idPatrimonio: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.patch<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/assets-liabilities/${idPatrimonio}`, datos, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  eliminarPatrimonio(idSolicitud: string, idPatrimonio: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.delete<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/assets-liabilities/${idPatrimonio}`, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  // ==== EMPLEOS ====
  listarEmpleos(idSolicitud: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${idSolicitud}/employments`);
  }

  crearEmpleo(idSolicitud: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.post<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/employments`, datos, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  actualizarEmpleo(idSolicitud: string, idEmpleo: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.patch<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/employments/${idEmpleo}`, datos, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  eliminarEmpleo(idSolicitud: string, idEmpleo: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.delete<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/employments/${idEmpleo}`, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  // ==== CRÉDITOS COMERCIALES ====
  listarCreditosComerciales(idSolicitud: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${idSolicitud}/commercial-credits`);
  }

  crearCreditoComercial(idSolicitud: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.post<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/commercial-credits`, datos, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  actualizarCreditoComercial(idSolicitud: string, idCredito: string, datos: any, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.patch<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/commercial-credits/${idCredito}`, datos, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

  eliminarCreditoComercial(idSolicitud: string, idCredito: string, versionBloqueo: number): Observable<SolicitudDistribuidora> {
    const headers = new HttpHeaders().set('If-Match', versionBloqueo.toString());
    return this.http.delete<SolicitudDistribuidoraResponseDTO>(`${this.baseUrl}/${idSolicitud}/commercial-credits/${idCredito}`, { headers }).pipe(
      map(SolicitudDistribuidoraMapper.mapToModel)
    );
  }

}
