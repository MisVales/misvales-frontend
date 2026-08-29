import { ProductDto, Producto } from './productos.dtos';

export class ProductosMapper {
  static fromDto(dto: ProductDto): Producto {
    return {
      id: dto.id,
      versionId: dto.version_id,
      estadoVersion: dto.version_status,
      nombre: dto.name,
      descripcion: dto.description,
      sku: dto.code,
      estado: dto.status,
      categoriaId: '',
      precioBase: dto.nominal_amount,
      precioActual: dto.nominal_amount,
      fechaCreacion: dto.created_at,
      versionRegistro: dto.lock_version,
      loanCommissionPercentage: dto.loan_commission_percentage,
      simpleInterestPercentage: dto.simple_interest_percentage,
      insuranceAmount: dto.insurance_amount,
      fortnightsCount: dto.fortnights_count,
      lateFeeAmount: dto.late_fee_amount,
    };
  }
}
