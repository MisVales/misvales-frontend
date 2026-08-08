export interface DevolverSolicitudCapturaRequestDto {
  motivo: string;
  seccionesPendientes: string[];
  lock_version: number;
}

export interface AsignarVerificadorRequestDto {
  verifier_id: string;
  lock_version: number;
}

export interface IniciarVisitaRequestDto {
  lock_version: number;
}

export interface ActualizarVisitaRequestDto {
  observaciones_generales?: string;
  diferencias?: {
    seccion: string;
    campo: string;
    dato_declarado: string;
    dato_observado: string;
    descripcion: string;
  }[];
  lock_version: number;
}

export interface AdjuntarEvidenciaRequestDto {
  tipo: string;
  file: File;
  lock_version: number;
}

export interface FinalizarVisitaRequestDto {
  resultado_fisico: 'FAVORABLE' | 'UNFAVORABLE';
  observaciones?: string;
  lock_version: number;
}

export interface AplicarCorreccionRequestDto {
  seccion: string;
  campo: string;
  valor_original: string;
  valor_observado: string;
  valor_corregido: string;
  motivo: string;
  lock_version: number;
}

export interface FinalizarCorreccionesRequestDto {
  lock_version: number;
}

export interface EvaluarSolicitudRequestDto {
  dictamen: 'COMPLIES' | 'DOES_NOT_COMPLY';
  motivo: string;
  lock_version: number;
}

export interface AutorizarSolicitudRequestDto {
  decision: 'APPROVED' | 'REJECTED';
  motivo: string;
  linea_inicial?: string; // Como decimal en string
  lock_version: number;
}

export interface EvidenciaVerificacionResponseDto {
  id: string;
  tipo: string;
  nombre_original: string;
  fecha_carga: string;
  cargado_por: string;
}

export interface VisitaVerificacionResponseDto {
  id: string;
  solicitud_id: string;
  verificador_id: string | null;
  estado: string;
  resultado_fisico: string | null;
  observaciones_generales: string | null;
  fecha_asignacion: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  diferencias: any[];
  evidencias: EvidenciaVerificacionResponseDto[];
  lock_version: number;
}

export interface CorreccionSolicitudResponseDto {
  id: string;
  seccion: string;
  campo: string;
  valor_original: string;
  valor_observado: string;
  valor_corregido: string;
  motivo: string;
  corregido_por: string;
  fecha_correccion: string;
}

export interface EvaluacionSolicitudResponseDto {
  id: string;
  coordinador_id: string;
  dictamen: string;
  motivo: string;
  fecha_evaluacion: string;
}

export interface AutorizacionSolicitudResponseDto {
  id: string;
  gerente_id: string;
  decision: string;
  motivo: string;
  linea_inicial: string | null;
  fecha_autorizacion: string;
}

export interface SolicitudDistribuidoraResponseDto {
  id: string;
  folio: string;
  aspirante: {
    nombre_completo: string;
    curp_enmascarado: string;
    rfc_enmascarado: string;
  };
  sucursal: {
    id: string;
    nombre: string;
  };
  coordinador_id: string | null;
  estado: string;
  fecha_envio: string;
  avance: number;
  datos_declarados: any;
  visitas: VisitaVerificacionResponseDto[];
  correcciones: CorreccionSolicitudResponseDto[];
  evaluacion: EvaluacionSolicitudResponseDto | null;
  autorizacion: AutorizacionSolicitudResponseDto | null;
  lock_version: number;
}

export interface ErrorApiResponseDto {
  error: {
    code: string;
    message: string;
    request_id?: string;
  };
}
