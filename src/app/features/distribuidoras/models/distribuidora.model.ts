export interface ReferenciaSucursal {
  id: string;
  nombre: string;
}

export interface ReferenciaUsuario {
  id: string;
  nombreCompleto: string;
}

import { EstadoDistribuidora, EstadoAccesoDistribuidora } from './estado-distribuidora.model';
import { CategoriaDistribuidora } from './categoria-distribuidora.model';

export interface Distribuidora {
  id: string;
  numero: string;
  nombreCompleto: string;
  estado: EstadoDistribuidora;
  estadoAcceso: EstadoAccesoDistribuidora;
  sucursal: ReferenciaSucursal;
  coordinador: ReferenciaUsuario | null;
  categoria: CategoriaDistribuidora | null;
  creadaEn: string | null;
  activadaEn: string | null;
  versionBloqueo: number;
}
