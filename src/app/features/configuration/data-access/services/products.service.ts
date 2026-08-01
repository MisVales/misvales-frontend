import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { internalApiContext } from '@core/api/api-request.context';

import { PaginatedResult, SingleResult } from '../../models/base.model';
import { ProductVersion } from '../../models/product.model';
import { ProductVersionDto } from '../dtos/product.dto';
import { mapProductVersionDtoToModel } from '../mappers/product.mapper';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/products';

  list(status?: string, page = 1, perPage = 20): Observable<PaginatedResult<ProductVersion>> {
    let params = new HttpParams().set('page', page).set('per_page', perPage);
    if (status) params = params.set('status', status);

    return this.http.get<PaginatedResult<ProductVersionDto>>(this.baseUrl, {
      context: internalApiContext(),
      params,
    }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(item => ({
          result: item.result.map(mapProductVersionDtoToModel)
        }))
      }))
    );
  }

  getVersions(publicId: string, page = 1, perPage = 20): Observable<PaginatedResult<ProductVersion>> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);

    return this.http.get<PaginatedResult<ProductVersionDto>>(`${this.baseUrl}/${publicId}/versions`, {
      context: internalApiContext(),
      params,
    }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(item => ({
          result: item.result.map(mapProductVersionDtoToModel)
        }))
      }))
    );
  }

  createProduct(amount: string, loanCommissionRate: string, interestRatePerFortnight: string, insuranceAmount: string, fortnightCount: number): Observable<ProductVersion> {
    return this.http.post<SingleResult<ProductVersionDto>>(this.baseUrl, { amount, loan_commission_rate: loanCommissionRate, interest_rate_per_fortnight: interestRatePerFortnight, insurance_amount: insuranceAmount, fortnight_count: fortnightCount }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapProductVersionDtoToModel(response.data.result))
    );
  }

  createDraft(publicId: string, amount: string, loanCommissionRate: string, interestRatePerFortnight: string, insuranceAmount: string, fortnightCount: number): Observable<ProductVersion> {
    return this.http.post<SingleResult<ProductVersionDto>>(`${this.baseUrl}/${publicId}/versions`, { amount, loan_commission_rate: loanCommissionRate, interest_rate_per_fortnight: interestRatePerFortnight, insurance_amount: insuranceAmount, fortnight_count: fortnightCount }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapProductVersionDtoToModel(response.data.result))
    );
  }

  updateDraft(publicId: string, versionPublicId: string, amount: string, loanCommissionRate: string, interestRatePerFortnight: string, insuranceAmount: string, fortnightCount: number, lockVersion: number): Observable<ProductVersion> {
    return this.http.put<SingleResult<ProductVersionDto>>(`${this.baseUrl}/${publicId}/versions/${versionPublicId}`, { amount, loan_commission_rate: loanCommissionRate, interest_rate_per_fortnight: interestRatePerFortnight, insurance_amount: insuranceAmount, fortnight_count: fortnightCount, lock_version: lockVersion }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapProductVersionDtoToModel(response.data.result))
    );
  }

  publish(publicId: string, versionPublicId: string, effectiveFrom: string, reason: string): Observable<ProductVersion> {
    return this.http.post<SingleResult<ProductVersionDto>>(`${this.baseUrl}/${publicId}/versions/${versionPublicId}/publish`, { effective_from: effectiveFrom, reason }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapProductVersionDtoToModel(response.data.result))
    );
  }

  deactivate(publicId: string, reason: string): Observable<ProductVersion> {
    return this.http.post<SingleResult<ProductVersionDto>>(`${this.baseUrl}/${publicId}/deactivate`, { reason }, {
      context: internalApiContext()
    }).pipe(
      map(response => mapProductVersionDtoToModel(response.data.result))
    );
  }
}
