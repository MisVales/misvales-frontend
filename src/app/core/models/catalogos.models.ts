export type EstadoVersion = 'BORRADOR' | 'PUBLICADO' | 'INACTIVO' | 'FUTURO';

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  porcentajeGanancia: string; // Mantener como string financiero
  estado: EstadoVersion;
  inicioVigencia: Date;
  motivo?: string;
  version: number;
  lockVersion?: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  montoNominal: string; // string financiero
  comisionPrestamo: string; // string financiero
  interesQuincenal: string; // string financiero
  seguro: string; // string financiero
  numeroQuincenas: number;
  estado: EstadoVersion;
  inicioVigencia: Date;
  motivo?: string;
  version: number;
  lockVersion?: string;
}
