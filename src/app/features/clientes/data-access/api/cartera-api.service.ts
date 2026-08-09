import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { MovimientoCartera } from '../../models/movimiento-cartera.model';
import { ResumenCartera } from '../../models/resumen-cartera.model';
import { ClientPortfolioEntryResponseDto } from '../dtos/client-portfolio-entry-response.dto';
import { CreateClientPortfolioEntryRequestDto } from '../dtos/create-client-portfolio-entry-request.dto';
import { UpdateClientPortfolioEntryRequestDto } from '../dtos/update-client-portfolio-entry-request.dto';
import { ClienteMapper } from '../mappers/cliente.mapper';

interface SummaryDto { current_balance: string; informational_status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | null; entries_count: number; last_payment_at: string | null; has_overdue_entries: boolean; is_zero_balance_for_transfer: boolean; }
export interface MovimientosCarteraRespuesta { data: MovimientoCartera[]; summary: ResumenCartera; }

@Injectable({ providedIn: 'root' })
export class CarteraApiService {
  private readonly http = inject(HttpClient);
  private mapSummary(summary: SummaryDto): ResumenCartera { return {
    saldoActual: summary.current_balance, estadoInformativo: summary.informational_status,
    ultimoPagoEn: summary.last_payment_at, cantidadMovimientos: summary.entries_count,
    tieneRegistrosVencidos: summary.has_overdue_entries, saldoCeroParaTransferencia: summary.is_zero_balance_for_transfer
  }; }

  listarCartera(id: string): Observable<MovimientosCarteraRespuesta> {
    return this.http.get<{ data: ClientPortfolioEntryResponseDto[]; summary: SummaryDto }>(`/api/v1/clients/${id}/portfolio-entries`)
      .pipe(map(response => ({ data: response.data.map(item => ClienteMapper.portfolioEntryFromDto(item)), summary: this.mapSummary(response.summary) })));
  }

  registrarMovimiento(id: string, entrada: CreateClientPortfolioEntryRequestDto, idempotencyKey: string): Observable<MovimientoCartera> {
    return this.http.post<{ data: ClientPortfolioEntryResponseDto }>(`/api/v1/clients/${id}/portfolio-entries`, entrada,
      { headers: new HttpHeaders().set('Idempotency-Key', idempotencyKey) })
      .pipe(map(response => ClienteMapper.portfolioEntryFromDto(response.data)));
  }

  actualizarMovimiento(id: string, movimientoId: string, entrada: UpdateClientPortfolioEntryRequestDto): Observable<MovimientoCartera> {
    return this.http.patch<{ data: ClientPortfolioEntryResponseDto }>(`/api/v1/clients/${id}/portfolio-entries/${movimientoId}`, entrada)
      .pipe(map(response => ClienteMapper.portfolioEntryFromDto(response.data)));
  }
}
