import { Distribuidora } from '../../models/distribuidora.model';
import { CategoriaDistribuidora } from '../../models/categoria-distribuidora.model';
import { DistributorListItemResponseDto } from '../dtos/distributor-list-item-response.dto';
import { DistributorDetailResponseDto } from '../dtos/distributor-detail-response.dto';
import { DistributorCategoryAssignmentResponseDto } from '../dtos/distributor-list-item-response.dto'; // Using the same as it's defined there

export class DistribuidoraMapper {
  static fromDto(dto: DistributorListItemResponseDto | DistributorDetailResponseDto): Distribuidora {
    return {
      id: dto.id,
      numero: dto.distributor_number ?? '',
      nombreCompleto: dto.full_name,
      estado: dto.status,
      estadoAcceso: dto.activation_status ?? 'DISABLED',
      sucursal: {
        id: dto.branch?.id ?? '',
        nombre: dto.branch?.name ?? 'Sin sucursal'
      },
      coordinador: dto.coordinator ? {
        id: dto.coordinator.id,
        nombreCompleto: dto.coordinator.name
      } : null,
      categoria: dto.category ? this.mapCategoria(dto.category) : null,
      lineaInicial: dto.initial_credit?.total_authorized ?? null,
      restriccionInicialActiva: dto.initial_restriction?.status === 'ACTIVE',
      creadaEn: dto.created_at ?? '',
      activadaEn: dto.activated_at ?? null,
      versionBloqueo: dto.lock_version
    };
  }

  static mapCategoria(dto: Partial<DistributorCategoryAssignmentResponseDto> & { id: string }): CategoriaDistribuidora {
    return {
      id: dto.id,
      nombre: dto.category?.name ?? dto.name ?? '',
      descripcion: dto.description ?? '',
      porcentajeGanancia: dto.category?.profit_rate ?? dto.profit_rate ?? dto.profit_percentage ?? '0',
      inicioVigencia: dto.starts_at ?? '',
      finVigencia: dto.ends_at ?? null,
      usuarioAsignoId: dto.assigned_by ?? dto.assigned_by_id ?? '',
      motivoAsignacion: dto.reason ?? null,
      estado: dto.status ?? (dto.ends_at ? 'HISTORIC' : 'ACTIVE')
    };
  }

  static fromDtoList(dtos: DistributorListItemResponseDto[]): Distribuidora[] {
    return dtos.map(dto => this.fromDto(dto));
  }
}
