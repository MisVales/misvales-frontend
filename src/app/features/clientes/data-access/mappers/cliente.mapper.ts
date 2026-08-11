import { Cliente } from '../../models/cliente.model';
import { ClientListItemResponseDto } from '../dtos/client-list-item-response.dto';
import { ClientDetailResponseDto } from '../dtos/client-detail-response.dto';
import { MovimientoCartera } from '../../models/movimiento-cartera.model';
import { ClientPortfolioEntryResponseDto } from '../dtos/client-portfolio-entry-response.dto';

export class ClienteMapper {
  static fromListItemDto(dto: ClientListItemResponseDto): Cliente {
    return {
      id: dto.id,
      numero: dto.client_number,
      nombreCompleto: dto.full_name,
      curpEnmascarada: dto.masked_curp,
      rfcEnmascarado: null,
      fechaNacimiento: '',
      lugarNacimiento: '',
      domicilioVigente: {
        id: '',
        calle: '',
        numeroExterior: '',
        numeroInterior: null,
        colonia: '',
        codigoPostal: '',
        municipio: '',
        ciudad: '',
        estado: '',
        pais: '',
        vigenteDesde: ''
      },
      cuentaBancariaVigente: null,
      asignacionVigente: {
        distribuidoraId: dto.distributor_id,
        sucursalId: dto.branch_id,
        fechaInicio: ''
      },
      resumenCartera: {
        saldoActual: dto.portfolio_summary.current_balance,
        estadoInformativo: dto.portfolio_summary.status ?? 'NO_RECORDS',
        ultimoPagoEn: dto.portfolio_summary.last_payment_date,
        cantidadMovimientos: 0,
        tieneRegistrosVencidos: false,
        saldoCeroParaTransferencia: false
      },
      creadoEn: dto.created_at,
      versionBloqueo: 0,
      estado: dto.portfolio_summary.status ?? 'NO_RECORDS'
    };
  }

  static fromDetailDto(dto: ClientDetailResponseDto): Cliente {
    return {
      id: dto.id,
      numero: dto.client_number,
      nombreCompleto: dto.full_name,
      curpEnmascarada: dto.masked_curp,
      rfcEnmascarado: dto.masked_rfc,
      fechaNacimiento: dto.birth_date,
      lugarNacimiento: dto.birth_place,
      domicilioVigente: {
        id: dto.active_address.id,
        calle: dto.active_address.street,
        numeroExterior: dto.active_address.exterior_number,
        numeroInterior: dto.active_address.interior_number,
        colonia: dto.active_address.neighborhood,
        codigoPostal: dto.active_address.zip_code,
        municipio: dto.active_address.municipality,
        ciudad: dto.active_address.city,
        estado: dto.active_address.state,
        pais: dto.active_address.country,
        vigenteDesde: dto.active_address.valid_from
      },
      cuentaBancariaVigente: dto.active_bank_account ? {
        id: dto.active_bank_account.id,
        banco: dto.active_bank_account.bank_name,
        titular: dto.active_bank_account.account_holder,
        cuentaEnmascarada: dto.active_bank_account.masked_account_number,
        clabeEnmascarada: dto.active_bank_account.masked_clabe,
        vigenteDesde: dto.active_bank_account.valid_from
      } : null,
      asignacionVigente: {
        distribuidoraId: dto.active_assignment.distributor_id,
        sucursalId: dto.active_assignment.branch_id,
        fechaInicio: dto.active_assignment.start_date
      },
      resumenCartera: {
        saldoActual: dto.portfolio_summary.current_balance,
        estadoInformativo: dto.portfolio_summary.status,
        ultimoPagoEn: dto.portfolio_summary.last_payment_date,
        cantidadMovimientos: dto.portfolio_summary.total_entries,
        tieneRegistrosVencidos: dto.portfolio_summary.has_overdue_entries,
        saldoCeroParaTransferencia: dto.portfolio_summary.is_zero_balance_for_transfer
      },
      creadoEn: dto.created_at,
      versionBloqueo: dto.lock_version,
      estado: dto.status
    };
  }

  static portfolioEntryFromDto(dto: ClientPortfolioEntryResponseDto): MovimientoCartera {
    return {
      id: dto.id,
      fecha: dto.date,
      tipo: dto.type,
      importe: dto.amount,
      concepto: dto.concept,
      saldoNuevo: dto.new_balance,
      registradoPor: dto.registered_by
    };
  }
}
