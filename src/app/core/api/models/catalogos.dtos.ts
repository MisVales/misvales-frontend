export type EstadoVersionApi = 'BORRADOR' | 'PUBLICADO' | 'INACTIVO' | 'FUTURO';

export interface CategoriaRes {
  id: string;
  nombre: string;
  descripcion: string;
  porcentajeGanancia: string; // string for precision
  estado: EstadoVersionApi;
  inicioVigencia: string; // ISO 8601
  motivo?: string;
  version: number;
  lockVersion?: string; // or If-Match equivalent
}

export interface CategoriaReq {
  nombre: string;
  descripcion: string;
  porcentajeGanancia: string;
  inicioVigencia: string; // ISO 8601
  motivo: string;
}

export interface ProductoRes {
  id: string;
  nombre: string;
  descripcion: string;
  montoNominal: string;
  comisionPrestamo: string;
  interesQuincenal: string;
  seguro: string;
  numeroQuincenas: number;
  estado: EstadoVersionApi;
  inicioVigencia: string; // ISO 8601
  motivo?: string;
  version: number;
  lockVersion?: string;
}

export interface ProductoReq {
  nombre: string;
  descripcion: string;
  montoNominal: string;
  comisionPrestamo: string;
  interesQuincenal: string;
  seguro: string;
  numeroQuincenas: number;
  inicioVigencia: string; // ISO 8601
  motivo: string;
}
