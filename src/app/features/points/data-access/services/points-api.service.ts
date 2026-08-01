import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { internalApiContext } from '@core/api/api-request.context';
import { toHttpParams } from '@core/api/query-params.util';

import {
  ContractResourceCollectionResponse,
  ContractResourceResponse,
  NullableContractResourceResponse,
  PointLedgerFilters,
  PointRedemptionDecisionRequest,
  PointsRunFilters,
} from '../dtos/points-contracts.dto';

@Injectable({ providedIn: 'root' })
export class PointsApiService {
  private readonly http = inject(HttpClient);

  ownBalance(): Observable<ContractResourceResponse> {
    return this.http.get<ContractResourceResponse>('/me/points', {
      context: internalApiContext(),
    });
  }

  ownMovements(filters: PointLedgerFilters = {}): Observable<ContractResourceCollectionResponse> {
    return this.http.get<ContractResourceCollectionResponse>('/me/points/movements', {
      context: internalApiContext(),
      params: pointLedgerParams(filters),
    });
  }

  distributorBalance(distributorId: string): Observable<ContractResourceResponse> {
    return this.http.get<ContractResourceResponse>(
      `/distributors/${encodeURIComponent(distributorId)}/points`,
      { context: internalApiContext() },
    );
  }

  distributorMovements(
    distributorId: string,
    filters: PointLedgerFilters = {},
  ): Observable<ContractResourceCollectionResponse> {
    return this.http.get<ContractResourceCollectionResponse>(
      `/distributors/${encodeURIComponent(distributorId)}/points/movements`,
      {
        context: internalApiContext(),
        params: pointLedgerParams(filters),
      },
    );
  }

  relationEvaluation(relationId: string): Observable<ContractResourceResponse> {
    return this.http.get<ContractResourceResponse>(
      `/relations/${encodeURIComponent(relationId)}/points`,
      { context: internalApiContext() },
    );
  }

  currentRedemptionPeriod(): Observable<NullableContractResourceResponse> {
    return this.http.get<NullableContractResourceResponse>('/point-redemption-periods/current', {
      context: internalApiContext(),
    });
  }

  ownRedemptions(filters: PointLedgerFilters = {}): Observable<ContractResourceCollectionResponse> {
    return this.http.get<ContractResourceCollectionResponse>('/me/point-redemptions', {
      context: internalApiContext(),
      params: pointLedgerParams(filters),
    });
  }

  redemptions(filters: PointLedgerFilters = {}): Observable<ContractResourceCollectionResponse> {
    return this.http.get<ContractResourceCollectionResponse>('/point-redemptions', {
      context: internalApiContext(),
      params: pointLedgerParams(filters),
    });
  }

  redemption(redemptionId: string): Observable<ContractResourceResponse> {
    return this.http.get<ContractResourceResponse>(
      `/point-redemptions/${encodeURIComponent(redemptionId)}`,
      { context: internalApiContext() },
    );
  }

  authorizeRedemption(
    redemptionId: string,
    payload: PointRedemptionDecisionRequest,
  ): Observable<ContractResourceResponse> {
    return this.http.post<ContractResourceResponse>(
      `/point-redemptions/${encodeURIComponent(redemptionId)}/authorize`,
      payload,
      { context: internalApiContext() },
    );
  }

  rejectRedemption(
    redemptionId: string,
    payload: PointRedemptionDecisionRequest,
  ): Observable<ContractResourceResponse> {
    return this.http.post<ContractResourceResponse>(
      `/point-redemptions/${encodeURIComponent(redemptionId)}/reject`,
      payload,
      { context: internalApiContext() },
    );
  }

  runs(filters: PointsRunFilters = {}): Observable<ContractResourceCollectionResponse> {
    return this.http.get<ContractResourceCollectionResponse>('/points-runs', {
      context: internalApiContext(),
      params: toHttpParams({ page: filters.page, per_page: filters.per_page }),
    });
  }

  run(runId: string): Observable<ContractResourceResponse> {
    return this.http.get<ContractResourceResponse>(`/points-runs/${encodeURIComponent(runId)}`, {
      context: internalApiContext(),
    });
  }

  runItems(
    runId: string,
    filters: PointsRunFilters = {},
  ): Observable<ContractResourceCollectionResponse> {
    return this.http.get<ContractResourceCollectionResponse>(
      `/points-runs/${encodeURIComponent(runId)}/items`,
      {
        context: internalApiContext(),
        params: toHttpParams({ page: filters.page, per_page: filters.per_page }),
      },
    );
  }
}

function pointLedgerParams(filters: PointLedgerFilters) {
  return toHttpParams({
    per_page: filters.per_page,
    relation_id: filters.relation_id,
    date_from: filters.date_from,
    date_to: filters.date_to,
  });
}
