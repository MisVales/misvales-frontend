import { Categoria, CategoryDto } from './categorias.dtos';

export class CategoriasMapper {
  static fromDto(dto: CategoryDto): Categoria {
    return {
      id: dto.id,
      nombre: dto.name,
      descripcion: dto.description,
      estado: dto.status,
      margenGanancia: dto.profit_margin,
      esCategoriaBase: dto.is_base_category,
      fechaCreacion: dto.created_at,
      versionRegistro: dto.lock_version
    };
  }
}
