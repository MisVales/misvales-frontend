export type EstadoSolicitudDistribuidora = 
  | 'DRAFT'
  | 'COORDINATOR_REVIEW'
  | 'VERIFIER_ASSIGNED'
  | 'PHYSICAL_VERIFICATION'
  | 'COORDINATOR_CORRECTION'
  | 'COORDINATOR_EVALUATION'
  | 'MANAGER_AUTHORIZATION'
  | 'TERMINATED_UNFAVORABLE'
  | 'AUTHORIZED_PENDING_ACTIVATION'
  | 'REJECTED'
  | 'ACTIVE';

export type ResultadoVisitaVerificacion = 'FAVORABLE' | 'UNFAVORABLE' | null;
export type EstadoVisitaVerificacion = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface DiferenciaVerificacion {
  id?: string;
  seccion: string;
  campo: string;
  datoDeclarado: string;
  datoObservado: string;
  descripcion: string;
}

export interface EvidenciaVerificacion {
  id: string;
  tipo: string;
  nombreOriginal: string;
  mimeType: string;
  urlDescarga?: string; // Solo temporal
  fechaCarga: string;
  cargadoPor: string;
}

export interface VisitaVerificacion {
  id: string;
  solicitudId: string;
  verificadorId: string | null;
  estado: EstadoVisitaVerificacion;
  resultadoFisico: ResultadoVisitaVerificacion;
  observacionesGenerales: string | null;
  fechaAsignacion: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  diferencias: DiferenciaVerificacion[];
  evidencias: EvidenciaVerificacion[];
  lockVersion: number;
}

export interface CorreccionSolicitud {
  id: string;
  seccion: string;
  campo: string;
  valorOriginal: string;
  valorObservado: string;
  valorCorregido: string;
  motivo: string;
  corregidoPor: string;
  fechaCorreccion: string;
}

export interface EvaluacionSolicitud {
  id: string;
  coordinadorId: string;
  dictamen: 'COMPLIES' | 'DOES_NOT_COMPLY';
  motivo: string;
  fechaEvaluacion: string;
}

export interface AutorizacionSolicitud {
  id: string;
  gerenteId: string;
  decision: 'APPROVED' | 'REJECTED';
  motivo: string;
  lineaInicialDecimal: string | null;
  fechaAutorizacion: string;
}

export interface SolicitudDistribuidora {
  id: string;
  folio: string;
  aspirante: {
    nombreCompleto: string;
    curpEnmascarado: string;
    rfcEnmascarado: string;
  };
  sucursal: {
    id: string;
    nombre: string;
  };
  coordinadorId: string | null;
  estado: EstadoSolicitudDistribuidora;
  fechaEnvio: string;
  avance: number; // 0-100
  visitas: VisitaVerificacion[];
  correcciones: CorreccionSolicitud[];
  evaluaciones: EvaluacionSolicitud[];
  ultimaEvaluacion: EvaluacionSolicitud | null;
  autorizacion: AutorizacionSolicitud | null;
  
  // Datos crudos del expediente original (resumen)
  datosDeclarados: Record<string, any>; // Estructura dependiente del backend
  
  lockVersion: number;
}

export interface VerificadorDisponible {
  id: string;
  nombreCompleto: string;
  sucursalId: string;
  estado: 'ACTIVE' | 'INACTIVE';
}

export interface PermisosVerificacion {
  puedeAsignarVerificador: boolean;
  puedeIniciarVisita: boolean;
  puedeRegistrarDiferencias: boolean;
  puedeSubirEvidencias: boolean;
  puedeFinalizarVisita: boolean;
  puedeCorregir: boolean;
  puedeEvaluar: boolean;
  puedeAutorizar: boolean;
}
