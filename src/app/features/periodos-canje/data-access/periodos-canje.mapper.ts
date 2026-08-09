import { ExchangePeriodDto, PeriodoCanje } from './periodos-canje.dtos';

export class PeriodosCanjeMapper {
  static fromDto(dto: ExchangePeriodDto): PeriodoCanje {
    return {
      id: dto.id,
      nombre: dto.name,
      fechaInicio: dto.start_date,
      fechaFin: dto.end_date,
      estado: dto.status,
      fechaCreacion: dto.created_at,
      versionRegistro: dto.lock_version
    };
  }
}
