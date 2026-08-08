import { Distribuidora } from '../../models/distribuidora.model';
import { CategoriaDistribuidora } from '../../models/categoria-distribuidora.model';
import { DistributorListItemResponseDto } from '../dtos/distributor-list-item-response.dto';
import { DistributorDetailResponseDto } from '../dtos/distributor-detail-response.dto';
import { DistributorCategoryAssignmentResponseDto } from '../dtos/distributor-list-item-response.dto'; // Using the same as it's defined there

export class DistribuidoraMapper {
  static fromDto(dto: DistributorListItemResponseDto | DistributorDetailResponseDto): Distribuidora {
    return {
      id: dto.id,
      numero: dto.number,
      nombreCompleto: dto.full_name,
      estado: dto.status,
      estadoAcceso: dto.access_status,
      sucursal: {
        id: dto.branch.id,
        nombre: dto.branch.name
      },
      coordinador: dto.coordinator ? {
        id: dto.coordinator.id,
        nombreCompleto: dto.coordinator.full_name
      } : null,
      categoria: dto.category ? this.mapCategoria(dto.category) : null,
      lineaInicial: dto.initial_credit_limit,
      restriccionInicialActiva: dto.initial_credit_restriction_active,
      creadaEn: dto.created_at,
      activadaEn: dto.activated_at,
      versionBloqueo: dto.lock_version
    };
  }

  static mapCategoria(dto: DistributorCategoryAssignmentResponseDto): CategoriaDistribuidora {
    return {
      id: dto.id,
      nombre: dto.name,
      descripcion: dto.description,
      porcentajeGanancia: dto.profit_percentage,
      inicioVigencia: dto.starts_at,
      finVigencia: dto.ends_at,
      usuarioAsignoId: dto.assigned_by_id,
      motivoAsignacion: dto.reason,
      estado: dto.status
    };
  }

  static fromDtoList(dtos: DistributorListItemResponseDto[]): Distribuidora[] {
    return dtos.map(dto => this.fromDto(dto));
  }
}
