import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { internalApiContext } from '@core/api/api-request.context';

import { PaginatedResult, SingleResult } from '../../models/base.model';
import { RedemptionPeriod } from '../../models/redemption-period.model';
import { RedemptionPeriodDto } from '../dtos/redemption-period.dto';
import { mapRedemptionPeriodDtoToModel } from '../mappers/redemption-period.mapper';

@Injectable({ providedIn: 'root' })
export class RedemptionPeriodsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/redemption-periods';

  list(status?: string, page = 1, perPage = 20): Observable<PaginatedResult<RedemptionPeriod>> {
    let params = new HttpParams().set('page', page).set('per_page', perPage);
    if (status) params = params.set('status', status);

    return this.http.get<PaginatedResult<RedemptionPeriodDto>>(this.baseUrl, {
      context: internalApiContext(),
      params,
    }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(item => ({
          result: item.result.map(mapRedemptionPeriodDtoToModel)
        }))
      }))
    );
  }

  create(name: string, description: string | null, startsAt: string, endsAt: string, reason: string | null): Observable<RedemptionPeriod> {
    return this.http.post<SingleResult<RedemptionPeriodDto>>(this.baseUrl, { name, description, starts_at: startsAt, ends_at: endsAt, reason }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapRedemptionPeriodDtoToModel(response.data.result))
    );
  }

  update(publicId: string, startsAt: string, endsAt: string, lockVersion: number): Observable<RedemptionPeriod> {
    return this.http.put<SingleResult<RedemptionPeriodDto>>(`${this.baseUrl}/${publicId}`, { starts_at: startsAt, ends_at: endsAt, lock_version: lockVersion }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapRedemptionPeriodDtoToModel(response.data.result))
    );
  }

  publish(publicId: string, reauthenticationToken: string, reason: string): Observable<RedemptionPeriod> {
    return this.http.post<SingleResult<RedemptionPeriodDto>>(`${this.baseUrl}/${publicId}/publish`, { reauthentication_token: reauthenticationToken, reason }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapRedemptionPeriodDtoToModel(response.data.result))
    );
  }

  deactivate(publicId: string, reason: string): Observable<RedemptionPeriod> {
    return this.http.post<SingleResult<RedemptionPeriodDto>>(`${this.baseUrl}/${publicId}/deactivate`, { reason }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapRedemptionPeriodDtoToModel(response.data.result))
    );
  }
}
