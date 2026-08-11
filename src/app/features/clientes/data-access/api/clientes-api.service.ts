import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { FiltroClientes } from '../../models/filtro-clientes.model';
import { Cliente } from '../../models/cliente.model';
import { ClienteMapper } from '../mappers/cliente.mapper';
import { ClientDetailResponseDto } from '../dtos/client-detail-response.dto';
import { CreateClientRequestDto } from '../dtos/create-client-request.dto';
import { ClientBankAccountResponseDto } from '../dtos/client-bank-account-response.dto';
import { CreateClientBankAccountRequestDto } from '../dtos/create-client-bank-account-request.dto';

export interface Pagina<T> { data: T[]; total: number; }

@Injectable({ providedIn: 'root' })
export class ClientesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/clients';

  listar(filtros: FiltroClientes): Observable<Pagina<Cliente>> {
    let params = new HttpParams();
    if (filtros.search) params = params.set('search', filtros.search);
    if (filtros.branchId) params = params.set('branch_id', filtros.branchId);
    if (filtros.distributorId) params = params.set('distributor_id', filtros.distributorId);
    if (filtros.status) params = params.set('portfolio_status', filtros.status);
    if (filtros.hasBalance !== undefined) params = params.set('has_portfolio_balance', String(filtros.hasBalance));
    params = params.set('page', String(filtros.page ?? 1));
    params = params.set('per_page', String(filtros.perPage ?? 10));

    return this.http.get<any>(this.baseUrl, { params }).pipe(map((response) => ({
      data: (response.data ?? []).map((item: any) => ClienteMapper.fromListItemDto({
        id: item.id,
        client_number: item.client_number,
        full_name: item.full_name,
        masked_curp: item.curp_masked,
        distributor_id: item.distributor?.id ?? '',
        branch_id: item.branch?.id ?? '',
        portfolio_summary: {
          current_balance: item.portfolio_summary?.current_balance ?? '0',
          status: item.portfolio_summary?.informational_status ?? null,
          last_payment_date: null,
        },
        created_at: item.created_at,
      })),
      total: response.meta?.total ?? response.data?.length ?? 0,
    })));
  }

  obtener(id: string): Observable<Cliente> {
    return this.http.get<{ data: any }>(`${this.baseUrl}/${id}`).pipe(map(({ data: item }) => {
      const address = item.address_history?.find((entry: any) => entry.is_current) ?? item.address ?? {};
      const bank = item.bank_account_history?.find((entry: any) => entry.is_current) ?? item.bank_account;
      const assignment = item.assignment_history?.find((entry: any) => !entry.ends_at) ?? {};
      const dto: ClientDetailResponseDto = {
        id: item.id, client_number: item.client_number, full_name: item.full_name, masked_curp: item.curp_masked,
        masked_rfc: item.rfc_masked ?? null, birth_date: item.birth_date, birth_place: item.birth_place,
        active_address: {
          id: address.id ?? '', street: address.street ?? '', exterior_number: address.exterior_number ?? '', interior_number: address.interior_number ?? null,
          neighborhood: address.neighborhood ?? '', zip_code: address.postal_code ?? '', city: address.city ?? '', municipality: address.municipality ?? '',
          state: address.state ?? '', country: address.country ?? 'MX', valid_from: address.starts_at ?? item.created_at,
        },
        active_bank_account: bank ? {
          id: bank.id ?? '', bank_name: bank.bank_name, account_holder: bank.account_holder_name,
          masked_account_number: bank.account_number_masked ?? null, masked_clabe: bank.clabe_masked, valid_from: bank.starts_at ?? item.created_at,
        } : null,
        active_assignment: {
          distributor_id: assignment.distributor_id ?? item.distributor?.id ?? '', branch_id: assignment.branch_id ?? item.branch?.id ?? '',
          start_date: assignment.starts_at ?? item.created_at,
        },
        portfolio_summary: {
          current_balance: item.portfolio_summary?.current_balance ?? '0', status: item.portfolio_summary?.informational_status ?? 'NO_RECORDS',
          last_payment_date: null, total_entries: 0, has_overdue_entries: false,
          is_zero_balance_for_transfer: item.portfolio_summary?.current_balance === '0.0000',
        },
        created_at: item.created_at, lock_version: item.lock_version, status: item.portfolio_summary?.informational_status ?? 'NO_RECORDS',
      };
      return ClienteMapper.fromDetailDto(dto);
    }));
  }

  crear(entrada: CreateClientRequestDto, idempotencyKey: string): Observable<Cliente> {
    const headers = new HttpHeaders().set('Idempotency-Key', idempotencyKey);
    return this.http.post<{ data: { id: string } }>(this.baseUrl, entrada, { headers }).pipe(map(({ data }) => ({ id: data.id } as Cliente)));
  }

  listarCuentas(id: string): Observable<ClientBankAccountResponseDto[]> {
    return this.http.get<{ data: any[] }>(`${this.baseUrl}/${id}/bank-accounts`).pipe(map(({ data }) => data.map((item) => ({
      id: item.id, bank_name: item.bank_name, account_holder: item.account_holder_name,
      masked_account_number: item.account_number_masked, masked_clabe: item.clabe_masked, valid_from: item.starts_at,
    }))));
  }

  crearCuenta(id: string, entrada: CreateClientBankAccountRequestDto): Observable<ClientBankAccountResponseDto> {
    return this.http.post<{ data: any }>(`${this.baseUrl}/${id}/bank-accounts`, entrada).pipe(map(({ data }) => ({
      id: data.id, bank_name: data.bank_name, account_holder: data.account_holder_name,
      masked_account_number: data.account_number_masked, masked_clabe: data.clabe_masked, valid_from: data.starts_at,
    })));
  }
}
