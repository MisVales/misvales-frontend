import { 
  SolicitudDistribuidora, 
  VerificadorDisponible, 
  VisitaVerificacion 
} from '../models/verificacion-distribuidoras.models';

export interface VerificacionDistribuidorasState {
  // Listados
  solicitudes: SolicitudDistribuidora[];
  visitasAsignadas: VisitaVerificacion[];
  verificadoresDisponibles: VerificadorDisponible[];
  
  // Elementos Seleccionados
  solicitudSeleccionada: SolicitudDistribuidora | null;
  visitaSeleccionada: VisitaVerificacion | null;
  
  // Paginación independiente para solicitudes y visitas.
  totalSolicitudes: number;
  pageSolicitudes: number;
  perPageSolicitudes: number;
  
  totalVisitas: number;
  pageVisitas: number;
  perPageVisitas: number;
  
  // Estados de la UI
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  conflictoVersion: boolean;
  accesoDenegado: boolean;
}

export const initialVerificacionDistribuidorasState: VerificacionDistribuidorasState = {
  solicitudes: [],
  visitasAsignadas: [],
  verificadoresDisponibles: [],
  
  solicitudSeleccionada: null,
  visitaSeleccionada: null,
  
  totalSolicitudes: 0,
  pageSolicitudes: 1,
  perPageSolicitudes: 10,
  
  totalVisitas: 0,
  pageVisitas: 1,
  perPageVisitas: 10,
  
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  conflictoVersion: false,
  accesoDenegado: false,
};
