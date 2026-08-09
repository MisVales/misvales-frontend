export interface PeriodoCanjeDTO {
  id: string;
  nombre: string;
  fechaInicio: string; // ISO 8601
  fechaFin: string; // ISO 8601
  valorPunto: string; // string para evitar coma flotante
  estado: 'vigente' | 'futuro' | 'cerrado';
  responsable: string;
  versionRegistro: number;
}

export interface CrearPeriodoDTO {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  valorPunto: string;
}

export interface ModificarPeriodoDTO {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  valorPunto: string;
}

export interface PaginacionRespuestaDTO<T> {
  datos: T[];
  total: number;
  pagina: number;
  porPagina: number;
}
