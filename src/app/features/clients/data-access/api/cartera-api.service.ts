import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { MovimientoCartera } from '../../models/movimiento-cartera.model';
import { ResumenCartera } from '../../models/resumen-cartera.model';
import { CreateClientPortfolioEntryRequestDto } from '../dtos/create-client-portfolio-entry-request.dto';
import { UpdateClientPortfolioEntryRequestDto } from '../dtos/update-client-portfolio-entry-request.dto';
import { ClientPortfolioEntryResponseDto } from '../dtos/client-portfolio-entry-response.dto';
import { ClienteMapper } from '../mappers/cliente.mapper';
import { API_CONFIG } from '@core/api/api.config';

export interface MovimientosCarteraRespuesta {
  data: MovimientoCartera[];
  summary?: ResumenCartera;
}

@Injectable({ providedIn: 'root' })
export class CarteraApiService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  listarCartera(id: string): Observable<MovimientosCarteraRespuesta> {
    return this.http.get<{ data: ClientPortfolioEntryResponseDto[]; summary?: any }>(`${this.apiConfig.baseUrl}/clients/${id}/portfolio-entries`).pipe(map(({ data, summary }) => ({
      data: (data ?? []).map((entry) => ClienteMapper.portfolioEntryFromDto(entry)),
      summary: summary ? {
        saldoActual: summary.current_balance ?? '0',
        estadoInformativo: summary.informational_status ?? summary.status ?? 'NO_RECORDS',
        ultimoPagoEn: summary.last_payment_at ?? summary.last_payment_date ?? null,
        cantidadMovimientos: summary.total_entries ?? data?.length ?? 0,
        tieneRegistrosVencidos: summary.has_overdue_entries ?? false,
        saldoCeroParaTransferencia: summary.is_zero_balance_for_transfer ?? false,
      } : undefined
    })));
  }

  registrarMovimiento(id: string, entrada: CreateClientPortfolioEntryRequestDto, idempotencyKey: string): Observable<MovimientoCartera> {
    const headers = new HttpHeaders().set('Idempotency-Key', idempotencyKey);
    return this.http.post<{ data: ClientPortfolioEntryResponseDto }>(`${this.apiConfig.baseUrl}/clients/${id}/portfolio-entries`, entrada, { headers }).pipe(
      map(({ data }) => ClienteMapper.portfolioEntryFromDto(data)),
    );
  }

  actualizarMovimiento(id: string, movimientoId: string, entrada: UpdateClientPortfolioEntryRequestDto): Observable<MovimientoCartera> {
    return this.http.patch<{ data: ClientPortfolioEntryResponseDto }>(`${this.apiConfig.baseUrl}/clients/${id}/portfolio-entries/${movimientoId}`, entrada).pipe(
      map(({ data }) => ClienteMapper.portfolioEntryFromDto(data)),
    );
  }
}
