import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { internalApiContext } from '@core/api/api-request.context';

import { PaginatedResult, SingleResult } from '../../models/base.model';
import { ConfigurationVersion } from '../../models/configuration.model';
import { ConfigurationVersionDto } from '../dtos/configuration.dto';
import { mapConfigurationVersionDtoToModel } from '../mappers/configuration.mapper';

@Injectable({ providedIn: 'root' })
export class ConfigurationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/configurations';

  list(type?: string, page = 1, perPage = 20): Observable<PaginatedResult<ConfigurationVersion>> {
    let params = new HttpParams().set('page', page).set('per_page', perPage);
    if (type) params = params.set('type', type);

    return this.http.get<PaginatedResult<ConfigurationVersionDto>>(this.baseUrl, {
      context: internalApiContext(),
      params,
    }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(item => ({
          result: item.result.map(mapConfigurationVersionDtoToModel)
        }))
      }))
    );
  }

  getVersions(key: string, status?: string, page = 1, perPage = 20): Observable<PaginatedResult<ConfigurationVersion>> {
    let params = new HttpParams().set('page', page).set('per_page', perPage);
    if (status) params = params.set('status', status);

    return this.http.get<PaginatedResult<ConfigurationVersionDto>>(`${this.baseUrl}/${key}/versions`, {
      context: internalApiContext(),
      params,
    }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(item => ({
          result: item.result.map(mapConfigurationVersionDtoToModel)
        }))
      }))
    );
  }

  createDraft(key: string, value: any): Observable<ConfigurationVersion> {
    return this.http.post<SingleResult<ConfigurationVersionDto>>(`${this.baseUrl}/${key}/versions`, { key, value }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapConfigurationVersionDtoToModel(response.data.result))
    );
  }

  updateDraft(key: string, publicId: string, value: any, lockVersion: number): Observable<ConfigurationVersion> {
    return this.http.put<SingleResult<ConfigurationVersionDto>>(`${this.baseUrl}/${key}/versions/${publicId}`, { value, lock_version: lockVersion }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapConfigurationVersionDtoToModel(response.data.result))
    );
  }

  publish(key: string, publicId: string, effectiveFrom: string, reason: string): Observable<ConfigurationVersion> {
    return this.http.post<SingleResult<ConfigurationVersionDto>>(`${this.baseUrl}/${key}/versions/${publicId}/publish`, { effective_from: effectiveFrom, reason }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapConfigurationVersionDtoToModel(response.data.result))
    );
  }

  deactivate(key: string, publicId: string, reason: string): Observable<ConfigurationVersion> {
    return this.http.post<SingleResult<ConfigurationVersionDto>>(`${this.baseUrl}/${key}/versions/${publicId}/deactivate`, { reason }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapConfigurationVersionDtoToModel(response.data.result))
    );
  }
}
