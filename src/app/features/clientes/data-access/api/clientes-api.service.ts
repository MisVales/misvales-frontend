import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Cliente } from '../../models/cliente.model';
import { FiltroClientes } from '../../models/filtro-clientes.model';
import { ClienteMapper } from '../mappers/cliente.mapper';
import { ClientBankAccountResponseDto } from '../dtos/client-bank-account-response.dto';
import { ClientDetailResponseDto } from '../dtos/client-detail-response.dto';
import { ClientListItemResponseDto } from '../dtos/client-list-item-response.dto';
import { CreateClientBankAccountRequestDto } from '../dtos/create-client-bank-account-request.dto';
import { CreateClientRequestDto } from '../dtos/create-client-request.dto';

export interface Pagina<T> { data: T[]; total: number; }

@Injectable({ providedIn: 'root' })
export class ClientesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/clients';

  listar(filtros: FiltroClientes): Observable<Pagina<Cliente>> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value)); });
    return this.http.get<{ data: ClientListItemResponseDto[]; meta: { total: number } }>(this.baseUrl, { params })
      .pipe(map(response => ({ data: response.data.map(item => ClienteMapper.fromListItemDto(item)), total: response.meta.total })));
  }

  obtener(id: string): Observable<Cliente> {
    return this.http.get<{ data: ClientDetailResponseDto }>(`${this.baseUrl}/${id}`)
      .pipe(map(response => ClienteMapper.fromDetailDto(response.data)));
  }

  crear(entrada: CreateClientRequestDto, idempotencyKey: string): Observable<Cliente> {
    return this.http.post<{ data: ClientListItemResponseDto }>(this.baseUrl, entrada, { headers: new HttpHeaders().set('Idempotency-Key', idempotencyKey) })
      .pipe(map(response => ClienteMapper.fromListItemDto(response.data)));
  }

  subirDocumento(archivo: File, tipo: 'OFFICIAL_ID' | 'ADDRESS_PROOF'): Observable<{ id: string }> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('document_type', tipo);
    return this.http.post<{ data: { id: string } }>('/api/v1/client-documents', formData).pipe(map(response => response.data));
  }

  listarCuentas(id: string): Observable<ClientBankAccountResponseDto[]> {
    return this.http.get<{ data: ClientBankAccountResponseDto[] }>(`${this.baseUrl}/${id}/bank-accounts`).pipe(map(response => response.data));
  }

  crearCuenta(id: string, entrada: CreateClientBankAccountRequestDto): Observable<ClientBankAccountResponseDto> {
    return this.http.post<{ data: ClientBankAccountResponseDto }>(`${this.baseUrl}/${id}/bank-accounts`, entrada).pipe(map(response => response.data));
  }
}
