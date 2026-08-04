export interface ConfiguracionDTO {
  id: string;
  clave: string;
  nombre: string;
  grupo: string; // Ej: 'Fechas y horarios', 'Crédito', etc.
  tipo: string; // Ej: 'monto', 'porcentaje', 'entero', 'fecha'
  valorVigente: string; // string para evitar errores de coma flotante
  inicioVigencia: string; // ISO 8601
  proximaVersionId?: string | null;
  estado: 'publicado' | 'borrador' | 'inactivo';
  versionRegistro: number;
}

export interface CrearVersionDTO {
  clave: string;
  valor: string; // string, ej: "150.50"
  inicioVigencia: string; // ISO 8601, enviado con timezone
  motivo: string;
}

export interface ModificarVersionDTO {
  valor: string;
  inicioVigencia: string;
  motivo: string;
}

export interface HistorialVersionesDTO {
  id: string;
  valorAnterior: string | null;
  valorNuevo: string;
  fechaCambio: string; // ISO 8601
  usuario: string;
  motivo: string;
  estadoAnterior: string;
  estadoNuevo: string;
  numeroVersion: number;
}

export interface PaginacionRespuestaDTO<T> {
  datos: T[];
  total: number;
  pagina: number;
  porPagina: number;
}
