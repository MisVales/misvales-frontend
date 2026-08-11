import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { MovimientoCartera } from '../../models/movimiento-cartera.model';
import { CreateClientPortfolioEntryRequestDto } from '../dtos/create-client-portfolio-entry-request.dto';
import { UpdateClientPortfolioEntryRequestDto } from '../dtos/update-client-portfolio-entry-request.dto';
import { ClientPortfolioEntryResponseDto } from '../dtos/client-portfolio-entry-response.dto';
import { ClienteMapper } from '../mappers/cliente.mapper';

export interface MovimientosCarteraRespuesta { data: MovimientoCartera[]; }

@Injectable({ providedIn: 'root' })
export class CarteraApiService {
  private readonly http = inject(HttpClient);

  listarCartera(id: string): Observable<MovimientosCarteraRespuesta> {
    return this.http.get<{ data: any[] }>(`/api/v1/clients/${id}/portfolio-entries`).pipe(map(({ data }) => ({
      data: data.map((entry) => ClienteMapper.portfolioEntryFromDto(this.toLegacyDto(entry))),
    })));
  }

  registrarMovimiento(id: string, entrada: CreateClientPortfolioEntryRequestDto, idempotencyKey: string): Observable<MovimientoCartera> {
    const headers = new HttpHeaders().set('Idempotency-Key', idempotencyKey);
    return this.http.post<{ data: any }>(`/api/v1/clients/${id}/portfolio-entries`, entrada, { headers }).pipe(
      map(({ data }) => ClienteMapper.portfolioEntryFromDto(this.toLegacyDto(data))),
    );
  }

  actualizarMovimiento(id: string, movimientoId: string, entrada: UpdateClientPortfolioEntryRequestDto): Observable<MovimientoCartera> {
    return this.http.patch<{ data: any }>(`/api/v1/clients/${id}/portfolio-entries/${movimientoId}`, entrada).pipe(
      map(({ data }) => ClienteMapper.portfolioEntryFromDto(this.toLegacyDto(data))),
    );
  }

  private toLegacyDto(entry: any): ClientPortfolioEntryResponseDto {
    const types: Record<string, ClientPortfolioEntryResponseDto['type']> = {
      DEBT: 'CHARGE', PAYMENT: 'PAYMENT', PARTIAL_PAYMENT: 'PAYMENT', NOTE: 'NOTE', STATUS_UPDATE: 'STATUS_UPDATE',
      ADJUSTMENT_INCREASE: 'ADJUSTMENT', ADJUSTMENT_DECREASE: 'ADJUSTMENT',
    };
    return {
      id: entry.id, date: entry.occurred_at, type: types[entry.entry_type] ?? 'NOTE', amount: entry.amount,
      concept: entry.note ?? entry.informational_status ?? entry.entry_type, new_balance: null, registered_by: entry.recorded_by ?? '',
    };
  }
}
