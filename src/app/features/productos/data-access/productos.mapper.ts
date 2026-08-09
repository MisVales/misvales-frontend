import { ProductDto, Producto } from './productos.dtos';

export class ProductosMapper {
  static fromDto(dto: ProductDto): Producto {
    return {
      id: dto.id,
      nombre: dto.name,
      descripcion: dto.description,
      sku: dto.sku,
      estado: dto.status,
      categoriaId: dto.category_id,
      precioBase: dto.base_price,
      precioActual: dto.current_price,
      fechaCreacion: dto.created_at,
      versionRegistro: dto.lock_version
    };
  }
}
