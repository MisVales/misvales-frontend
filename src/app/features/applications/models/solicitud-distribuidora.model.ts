export interface SolicitudDistribuidora {
  id: string;
  folio: string;
  estado: EstadoSolicitudDistribuidora;
  sucursalId: string; // Simplificando por ahora
  coordinadorId: string; // Simplificando por ahora
  sucursal?: { id: string; nombre: string };
  coordinador?: { id: string; nombre: string };
  solicitante: ResumenSolicitante | null;
  datosPersonales?: DatosPersonales | null;
  declaracionesSeccion: DeclaracionesSeccion;
  avance: AvanceExpediente;
  versionBloqueo: number;
  enviadaPor: string | null;
  enviadaEn: string | null;
  creadaEn: string;
  actualizadaEn: string;
  hasVehicleEvidence?: boolean;
  hasAssetsEvidence?: boolean;
  hasCommercialCreditEvidence?: boolean;
}

export interface DatosPersonales {
  nationality: 'MEXICAN' | 'FOREIGN';
  first_name: string;
  first_last_name: string;
  second_last_name?: string | null;
  curp?: string | null;
  curp_masked?: string | null;
  rfc?: string | null;
  birth_country: string;
  birth_date: string;
  birth_state: string;
  birth_city: string;
  email: string;
  phone_number: string;
  identification_country?: string | null;
  official_id_type: string;
  official_id_number?: string | null;
  has_identification_evidence?: boolean;
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
  | 'AUTHORIZED_PENDING_ACTIVATION'
  | 'ACTIVE';

export interface ResumenSolicitante {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curpEnmascarada: string; 
  nombreCompleto?: string;
}

export interface DeclaracionesSeccion {
  datosPersonales: EstadoDeclaracion;
  domicilios: EstadoDeclaracion;
  pareja: EstadoDeclaracion;
  hijos: EstadoDeclaracion;
  referenciasFamiliares: EstadoDeclaracion;
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
