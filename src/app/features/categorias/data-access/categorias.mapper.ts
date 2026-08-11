import { Categoria, CategoryDto } from './categorias.dtos';

export class CategoriasMapper {
  static fromDto(dto: CategoryDto): Categoria {
    return {
      id: dto.id,
      versionId: dto.version_id,
      codigo: dto.code,
      nombre: dto.name,
      descripcion: dto.description,
      estado: dto.status,
      margenGanancia: dto.profit_margin,
      estadoVersion: dto.version_status,
      vigenciaDesde: dto.effective_from,
      motivo: dto.reason,
      fechaCreacion: dto.created_at,
      versionRegistro: dto.lock_version
    };
  }
}
