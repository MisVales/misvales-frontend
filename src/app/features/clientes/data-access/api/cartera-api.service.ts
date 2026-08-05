import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { MovimientoCartera } from '../../models/movimiento-cartera.model';
import { CreateClientPortfolioEntryRequestDto } from '../dtos/create-client-portfolio-entry-request.dto';
import { UpdateClientPortfolioEntryRequestDto } from '../dtos/update-client-portfolio-entry-request.dto';
import { ClientPortfolioEntryResponseDto } from '../dtos/client-portfolio-entry-response.dto';
import { ClienteMapper } from '../mappers/cliente.mapper';

export interface MovimientosCarteraRespuesta {
  data: MovimientoCartera[];
}

@Injectable({ providedIn: 'root' })
export class CarteraApiService {
  private http = inject(HttpClient);

  listarCartera(id: string): Observable<MovimientosCarteraRespuesta> {
    // Mock
    const mockEntries: ClientPortfolioEntryResponseDto[] = [
      {
        id: 'm-1',
        date: '2024-01-15T12:00:00Z',
        type: 'CHARGE',
        amount: '1500.00',
        concept: 'Nuevo Vale (Adeudo)',
        new_balance: '1500.00',
        registered_by: 'Distribuidora Juan'
      }
    ];
    return of({
      data: mockEntries.map(e => ClienteMapper.portfolioEntryFromDto(e))
    }).pipe(delay(400));
  }

  registrarMovimiento(id: string, entrada: CreateClientPortfolioEntryRequestDto, idempotencyKey: string): Observable<MovimientoCartera> {
    const headers = new HttpHeaders().set('Idempotency-Key', idempotencyKey);
    // Mock
    const mockResp: ClientPortfolioEntryResponseDto = {
      id: 'm-new',
      date: new Date().toISOString(),
      type: entrada.type,
      amount: entrada.amount,
      concept: entrada.concept,
      new_balance: null,
      registered_by: 'Distribuidora Actual'
    };
    return of(ClienteMapper.portfolioEntryFromDto(mockResp)).pipe(delay(600));
  }

  actualizarMovimiento(id: string, movimientoId: string, entrada: UpdateClientPortfolioEntryRequestDto): Observable<MovimientoCartera> {
    const headers = new HttpHeaders().set('If-Match', `"${entrada.lock_version}"`); // O lock_version
    // Mock
    const mockResp: ClientPortfolioEntryResponseDto = {
      id: movimientoId,
      date: new Date().toISOString(),
      type: 'NOTE',
      amount: null,
      concept: entrada.concept || 'Actualizado',
      new_balance: null,
      registered_by: 'Distribuidora Actual'
    };
    return of(ClienteMapper.portfolioEntryFromDto(mockResp)).pipe(delay(600));
  }
}
