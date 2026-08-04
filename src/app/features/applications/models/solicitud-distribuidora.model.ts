export interface SolicitudDistribuidora {
  id: string;
  folio: string;
  estado: EstadoSolicitudDistribuidora;
  sucursalId: string; // Simplificando por ahora
  coordinadorId: string; // Simplificando por ahora
  solicitante: ResumenSolicitante | null;
  declaracionesSeccion: DeclaracionesSeccion;
  avance: AvanceExpediente;
  versionBloqueo: number;
  enviadaPor: string | null;
  enviadaEn: string | null;
  creadaEn: string;
  actualizadaEn: string;
}

export type EstadoSolicitudDistribuidora = 
  | 'DRAFT'
  | 'COORDINATOR_REVIEW'
  | 'VERIFIER_ASSIGNED'
  | 'PHYSICAL_VERIFICATION'
  | 'COORDINATOR_CORRECTION'
  | 'COORDINATOR_EVALUATION'
  | 'MANAGER_AUTHORIZATION'
  | 'TERMINATED_UNFAVORABLE'
  | 'REJECTED'
  | 'ACTIVE';

export interface ResumenSolicitante {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curpEnmascarada: string; 
}

export interface DeclaracionesSeccion {
  datosPersonales: EstadoDeclaracion;
  referenciasFamiliares: EstadoDeclaracion;
  domicilios: EstadoDeclaracion;
  vehiculos: EstadoDeclaracion;
  bienes: EstadoDeclaracion;
  pasivos: EstadoDeclaracion;
  empleos: EstadoDeclaracion;
  creditosComerciales: EstadoDeclaracion;
}

export type EstadoDeclaracion = 'PENDING' | 'COMPLETED' | 'NOT_APPLICABLE';

export interface AvanceExpediente {
  seccionesCompletadas: number;
  seccionesTotales: number;
  puedeEnviarse: boolean;
}

export interface PaginacionRespuesta<T> {
  datos: T[];
  paginaActiva: number;
  ultimaPagina: number;
  porPagina: number;
  total: number;
}
