import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { internalApiContext } from '@core/api/api-request.context';

import { PaginatedResult, SingleResult } from '../../models/base.model';
import { CategoryVersion } from '../../models/category.model';
import { CategoryVersionDto } from '../dtos/category.dto';
import { mapCategoryVersionDtoToModel } from '../mappers/category.mapper';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/categories';

  list(status?: string, page = 1, perPage = 20): Observable<PaginatedResult<CategoryVersion>> {
    let params = new HttpParams().set('page', page).set('per_page', perPage);
    if (status) params = params.set('status', status);

    return this.http.get<PaginatedResult<CategoryVersionDto>>(this.baseUrl, {
      context: internalApiContext(),
      params,
    }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(item => ({
          result: item.result.map(mapCategoryVersionDtoToModel)
        }))
      }))
    );
  }

  getVersions(publicId: string, page = 1, perPage = 20): Observable<PaginatedResult<CategoryVersion>> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);

    return this.http.get<PaginatedResult<CategoryVersionDto>>(`${this.baseUrl}/${publicId}/versions`, {
      context: internalApiContext(),
      params,
    }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(item => ({
          result: item.result.map(mapCategoryVersionDtoToModel)
        }))
      }))
    );
  }

  createCategory(name: string, description: string, distributorProfitRate: string): Observable<CategoryVersion> {
    return this.http.post<SingleResult<CategoryVersionDto>>(this.baseUrl, { name, description, distributor_profit_rate: distributorProfitRate }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapCategoryVersionDtoToModel(response.data.result))
    );
  }

  createDraft(publicId: string, name: string, description: string, distributorProfitRate: string): Observable<CategoryVersion> {
    return this.http.post<SingleResult<CategoryVersionDto>>(`${this.baseUrl}/${publicId}/versions`, { name, description, distributor_profit_rate: distributorProfitRate }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapCategoryVersionDtoToModel(response.data.result))
    );
  }

  updateDraft(publicId: string, versionPublicId: string, name: string, description: string, distributorProfitRate: string, lockVersion: number): Observable<CategoryVersion> {
    return this.http.put<SingleResult<CategoryVersionDto>>(`${this.baseUrl}/${publicId}/versions/${versionPublicId}`, { name, description, distributor_profit_rate: distributorProfitRate, lock_version: lockVersion }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapCategoryVersionDtoToModel(response.data.result))
    );
  }

  publish(publicId: string, versionPublicId: string, effectiveFrom: string, reason: string): Observable<CategoryVersion> {
    return this.http.post<SingleResult<CategoryVersionDto>>(`${this.baseUrl}/${publicId}/versions/${versionPublicId}/publish`, { effective_from: effectiveFrom, reason }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapCategoryVersionDtoToModel(response.data.result))
    );
  }

  deactivate(publicId: string, reason: string): Observable<CategoryVersion> {
    return this.http.post<SingleResult<CategoryVersionDto>>(`${this.baseUrl}/${publicId}/deactivate`, { reason }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapCategoryVersionDtoToModel(response.data.result))
    );
  }
}
