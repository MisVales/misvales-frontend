import { ClienteMapper } from './cliente.mapper';
import { ClientListItemResponseDto } from '../dtos/client-list-item-response.dto';
import { ClientDetailResponseDto } from '../dtos/client-detail-response.dto';

const base: ClientListItemResponseDto = {
  id: '1', client_number: 'CLI-001', full_name: 'Juan Pérez', curp_masked: '***************123',
  birth_date: '1990-01-01',
  address: { street: 'Uno', exterior_number: '2', interior_number: null, neighborhood: 'Centro', postal_code: '00000', municipality: 'Municipio', city: 'Ciudad', state: 'Estado', country: 'MX' },
  bank_account: { bank_name: 'Banco', account_holder_name: 'Juan Pérez', clabe_masked: '****1234' },
  branch: { id: 'b-1', name: 'Sucursal' }, distributor: { id: 'd-1', distributor_number: 'DIS-1' },
  portfolio_summary: { current_balance: '1000.0000', informational_status: 'PENDING' }, lock_version: 1,
  created_at: '2024-01-10T10:00:00Z'
};

describe('ClienteMapper', () => {
  it('mapea el contrato real del listado', () => {
    const result = ClienteMapper.fromListItemDto(base);
    expect(result.numero).toBe('CLI-001');
    expect(result.curpEnmascarada).toBe('***************123');
    expect(result.resumenCartera.saldoActual).toBe('1000.0000');
    expect(result.asignacionVigente.distribuidoraId).toBe('d-1');
  });

  it('mapea el detalle sin exponer identificadores completos', () => {
    const dto: ClientDetailResponseDto = { ...base, first_name: 'Juan', first_last_name: 'Pérez', second_last_name: null,
      rfc_masked: '*********1234', birth_place: 'México', birth_state: 'Estado', birth_city: 'Ciudad',
      official_id_type: 'INE', official_id_number_masked: '****1234', address_history: [], bank_account_history: [], assignment_history: [] };
    const result = ClienteMapper.fromDetailDto(dto);
    expect(result.rfcEnmascarado).toBe('*********1234');
    expect(result.domicilioVigente.calle).toBe('Uno');
  });
});
