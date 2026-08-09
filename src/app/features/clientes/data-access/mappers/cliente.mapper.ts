import { Cliente } from '../../models/cliente.model';
import { MovimientoCartera } from '../../models/movimiento-cartera.model';
import { ClientDetailResponseDto } from '../dtos/client-detail-response.dto';
import { ClientListItemResponseDto } from '../dtos/client-list-item-response.dto';
import { ClientPortfolioEntryResponseDto } from '../dtos/client-portfolio-entry-response.dto';

export class ClienteMapper {
  static fromListItemDto(dto: ClientListItemResponseDto): Cliente {
    return this.mapear(dto);
  }

  static fromDetailDto(dto: ClientDetailResponseDto): Cliente {
    return this.mapear(dto);
  }

  private static mapear(dto: ClientListItemResponseDto | ClientDetailResponseDto): Cliente {
    const detalle = dto as Partial<ClientDetailResponseDto>;
    return {
      id: dto.id, numero: dto.client_number, nombreCompleto: dto.full_name,
      curpEnmascarada: dto.curp_masked, rfcEnmascarado: detalle.rfc_masked ?? null,
      fechaNacimiento: dto.birth_date, lugarNacimiento: detalle.birth_place ?? '',
      domicilioVigente: {
        id: '', calle: dto.address?.street ?? '', numeroExterior: dto.address?.exterior_number ?? '',
        numeroInterior: dto.address?.interior_number ?? null, colonia: dto.address?.neighborhood ?? '',
        codigoPostal: dto.address?.postal_code ?? '', municipio: dto.address?.municipality ?? '',
        ciudad: dto.address?.city ?? '', estado: dto.address?.state ?? '', pais: dto.address?.country ?? 'MX', vigenteDesde: ''
      },
      cuentaBancariaVigente: dto.bank_account ? {
        id: '', banco: dto.bank_account.bank_name, titular: dto.bank_account.account_holder_name,
        cuentaEnmascarada: null, clabeEnmascarada: dto.bank_account.clabe_masked, vigenteDesde: ''
      } : null,
      asignacionVigente: {
        distribuidoraId: dto.distributor?.id ?? '', sucursalId: dto.branch?.id ?? '', fechaInicio: ''
      },
      resumenCartera: {
        saldoActual: dto.portfolio_summary.current_balance,
        estadoInformativo: dto.portfolio_summary.informational_status,
        ultimoPagoEn: null, cantidadMovimientos: 0, tieneRegistrosVencidos: false,
        saldoCeroParaTransferencia: dto.portfolio_summary.current_balance === '0.0000'
      },
      creadoEn: dto.created_at, versionBloqueo: dto.lock_version, estado: 'ACTIVE'
    };
  }

  static portfolioEntryFromDto(dto: ClientPortfolioEntryResponseDto): MovimientoCartera {
    return {
      id: dto.id, fecha: dto.occurred_at, tipo: dto.entry_type, importe: dto.amount,
      concepto: dto.note ?? dto.informational_status ?? dto.entry_type, saldoNuevo: null,
      registradoPor: dto.recorded_by, estadoInformativo: dto.informational_status,
      versionBloqueo: dto.lock_version
    };
  }
}
