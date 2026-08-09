import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FiltroClientes } from '../../models/filtro-clientes.model';
import { Cliente } from '../../models/cliente.model';
import { ClienteMapper } from '../mappers/cliente.mapper';
import { ClientListItemResponseDto } from '../dtos/client-list-item-response.dto';
import { ClientDetailResponseDto } from '../dtos/client-detail-response.dto';
import { CreateClientRequestDto } from '../dtos/create-client-request.dto';
import { ClientBankAccountResponseDto } from '../dtos/client-bank-account-response.dto';
import { CreateClientBankAccountRequestDto } from '../dtos/create-client-bank-account-request.dto';

export interface Pagina<T> {
  data: T[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ClientesApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/clients';

  listar(filtros: FiltroClientes): Observable<Pagina<Cliente>> {
    // This would be a real HTTP call
    // return this.http.get<{data: ClientListItemResponseDto[], total: number}>(this.baseUrl, { params: ... })
    
    // MOCK DATA for local testing
    const mockList: ClientListItemResponseDto[] = [
      {
        id: 'c-1',
        client_number: 'CLI-001',
        full_name: 'Juan Pérez López',
        masked_curp: 'PELJ80XXXXXX',
        distributor_id: 'd-1',
        branch_id: 'b-1',
        portfolio_summary: {
          current_balance: '1500.00',
          status: 'PENDING',
          last_payment_date: null
        },
        created_at: '2024-01-10T10:00:00Z'
      }
    ];

    return of({
      data: mockList.map(item => ClienteMapper.fromListItemDto(item)),
      total: 1
    }).pipe(delay(500));
  }

  obtener(id: string): Observable<Cliente> {
    const mockDetail: ClientDetailResponseDto = {
      id: id,
      client_number: 'CLI-001',
      full_name: 'Juan Pérez López',
      masked_curp: 'PELJ80XXXXXX',
      masked_rfc: 'PELJ80XXX',
      birth_date: '1980-01-01',
      birth_place: 'Jalisco',
      active_address: {
        id: 'addr-1',
        street: 'Av. Vallarta',
        exterior_number: '123',
        interior_number: null,
        neighborhood: 'Centro',
        zip_code: '44100',
        city: 'Guadalajara',
        municipality: 'Guadalajara',
        state: 'Jalisco',
        country: 'MX',
        valid_from: '2024-01-10'
      },
      active_bank_account: {
        id: 'acc-1',
        bank_name: 'BBVA',
        account_holder: 'Juan Pérez',
        masked_account_number: '****1234',
        masked_clabe: '0123456789012****',
        valid_from: '2024-01-10'
      },
      active_assignment: {
        distributor_id: 'd-1',
        branch_id: 'b-1',
        start_date: '2024-01-10'
      },
      portfolio_summary: {
        current_balance: '1500.00',
        status: 'PENDING',
        last_payment_date: null,
        total_entries: 2,
        has_overdue_entries: false,
        is_zero_balance_for_transfer: false
      },
      created_at: '2024-01-10T10:00:00Z',
      lock_version: 1,
      status: 'ACTIVE'
    };
    return of(ClienteMapper.fromDetailDto(mockDetail)).pipe(delay(500));
  }

  crear(entrada: CreateClientRequestDto, idempotencyKey: string): Observable<Cliente> {
    const headers = new HttpHeaders().set('Idempotency-Key', idempotencyKey);
    // Real call:
    // return this.http.post<ClientDetailResponseDto>(this.baseUrl, entrada, { headers })
    //   .pipe(map(dto => ClienteMapper.fromDetailDto(dto)));
    
    // Mock response
    return this.obtener('new-id').pipe(delay(800));
  }

  listarCuentas(id: string): Observable<ClientBankAccountResponseDto[]> {
    return of([]).pipe(delay(300));
  }

  crearCuenta(id: string, entrada: CreateClientBankAccountRequestDto): Observable<ClientBankAccountResponseDto> {
    return of({
      id: 'acc-new',
      bank_name: entrada.bank_name,
      account_holder: entrada.account_holder,
      masked_account_number: entrada.account_number ? '****' : null,
      masked_clabe: '****' + entrada.clabe.slice(-4),
      valid_from: new Date().toISOString()
    }).pipe(delay(500));
  }
}
