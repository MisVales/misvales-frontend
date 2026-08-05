import { ClienteMapper } from './cliente.mapper';
import { ClientListItemResponseDto } from '../dtos/client-list-item-response.dto';
import { ClientDetailResponseDto } from '../dtos/client-detail-response.dto';

describe('ClienteMapper', () => {
  it('should map from list item dto correctly', () => {
    const dto: ClientListItemResponseDto = {
      id: '1',
      client_number: 'CLI-001',
      full_name: 'Juan Pérez',
      masked_curp: 'PELJ80XXXXXX',
      distributor_id: 'd-1',
      branch_id: 'b-1',
      portfolio_summary: {
        current_balance: '1000.00',
        status: 'PENDING',
        last_payment_date: null
      },
      created_at: '2024-01-10T10:00:00Z'
    };

    const result = ClienteMapper.fromListItemDto(dto);

    expect(result.id).toBe('1');
    expect(result.numero).toBe('CLI-001');
    expect(result.nombreCompleto).toBe('Juan Pérez');
    expect(result.curpEnmascarada).toBe('PELJ80XXXXXX');
    expect(result.resumenCartera.saldoActual).toBe('1000.00');
    expect(result.resumenCartera.estadoInformativo).toBe('PENDING');
  });

  it('should map from detail dto correctly', () => {
    const dto: ClientDetailResponseDto = {
      id: '2',
      client_number: 'CLI-002',
      full_name: 'Maria Gomez',
      masked_curp: 'GOMM90XXXXXX',
      masked_rfc: 'GOMM90XXX',
      birth_date: '1990-01-01',
      birth_place: 'DF',
      active_address: {
        id: 'addr-1',
        street: 'Calle 1',
        exterior_number: '12',
        interior_number: null,
        neighborhood: 'Col 2',
        zip_code: '00000',
        city: 'CDMX',
        municipality: 'CDMX',
        state: 'CDMX',
        country: 'MX',
        valid_from: '2024-01-01'
      },
      active_bank_account: null,
      active_assignment: {
        distributor_id: 'd-2',
        branch_id: 'b-2',
        start_date: '2024-01-01'
      },
      portfolio_summary: {
        current_balance: '0.00',
        status: 'PAID',
        last_payment_date: '2024-02-01',
        total_entries: 5,
        has_overdue_entries: false,
        is_zero_balance_for_transfer: true
      },
      created_at: '2024-01-01T10:00:00Z',
      lock_version: 1,
      status: 'ACTIVE'
    };

    const result = ClienteMapper.fromDetailDto(dto);

    expect(result.id).toBe('2');
    expect(result.rfcEnmascarado).toBe('GOMM90XXX');
    expect(result.cuentaBancariaVigente).toBeNull();
    expect(result.resumenCartera.saldoActual).toBe('0.00');
    expect(result.resumenCartera.estadoInformativo).toBe('PAID');
    expect(result.domicilioVigente.calle).toBe('Calle 1');
  });
});
