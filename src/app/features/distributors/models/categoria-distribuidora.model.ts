export interface CategoriaDistribuidora {
  id: string;
  nombre: string;
  descripcion: string;
  porcentajeGanancia: string;
  inicioVigencia: string;
  finVigencia: string | null;
  usuarioAsignoId: string;
  motivoAsignacion: string | null;
  estado: 'ACTIVE' | 'HISTORIC';
}
