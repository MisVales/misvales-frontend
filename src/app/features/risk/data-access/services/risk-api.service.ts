import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { internalApiContext } from '@core/api/api-request.context';
import { toHttpParams } from '@core/api/query-params.util';

import {
  RemovalPreparationRequest,
  RiskContractCollectionResponse,
  RiskContractResourceResponse,
  RiskDecisionRequest,
  RiskFilters,
} from '../dtos/risk-contracts.dto';

@Injectable({ providedIn: 'root' })
export class RiskApiService {
  private readonly http = inject(HttpClient);

  distributors(filters: RiskFilters = {}): Observable<RiskContractCollectionResponse> {
    return this.http.get<RiskContractCollectionResponse>('/risk/distributors', {
      context: internalApiContext(),
      params: riskParams(filters),
    });
  }

  distributor(
    distributorId: string,
    filters: RiskFilters = {},
  ): Observable<RiskContractResourceResponse> {
    return this.http.get<RiskContractResourceResponse>(
      `/risk/distributors/${encodeURIComponent(distributorId)}`,
      { context: internalApiContext(), params: riskParams(filters) },
    );
  }

  evaluations(
    distributorId: string,
    filters: RiskFilters = {},
  ): Observable<RiskContractCollectionResponse> {
    return this.http.get<RiskContractCollectionResponse>(
      `/risk/distributors/${encodeURIComponent(distributorId)}/evaluations`,
      { context: internalApiContext(), params: riskParams(filters) },
    );
  }

  sequence(
    distributorId: string,
    filters: RiskFilters = {},
  ): Observable<RiskContractResourceResponse> {
    return this.http.get<RiskContractResourceResponse>(
      `/risk/distributors/${encodeURIComponent(distributorId)}/sequence`,
      { context: internalApiContext(), params: riskParams(filters) },
    );
  }

  alerts(
    distributorId: string,
    filters: RiskFilters = {},
  ): Observable<RiskContractCollectionResponse> {
    return this.http.get<RiskContractCollectionResponse>(
      `/risk/distributors/${encodeURIComponent(distributorId)}/alerts`,
      { context: internalApiContext(), params: riskParams(filters) },
    );
  }

  alert(alertId: string, filters: RiskFilters = {}): Observable<RiskContractResourceResponse> {
    return this.http.get<RiskContractResourceResponse>(
      `/risk/alerts/${encodeURIComponent(alertId)}`,
      { context: internalApiContext(), params: riskParams(filters) },
    );
  }

  alertReview(
    alertId: string,
    filters: RiskFilters = {},
  ): Observable<RiskContractResourceResponse> {
    return this.http.get<RiskContractResourceResponse>(
      `/risk/alerts/${encodeURIComponent(alertId)}/review`,
      { context: internalApiContext(), params: riskParams(filters) },
    );
  }

  applyDelinquency(
    alertId: string,
    payload: RiskDecisionRequest,
  ): Observable<RiskContractResourceResponse> {
    return this.http.post<RiskContractResourceResponse>(
      `/risk/alerts/${encodeURIComponent(alertId)}/apply-delinquency`,
      payload,
      { context: internalApiContext() },
    );
  }

  prepareRemoval(
    distributorId: string,
    payload: RemovalPreparationRequest,
  ): Observable<RiskContractResourceResponse> {
    return this.http.post<RiskContractResourceResponse>(
      `/delinquency/distributors/${encodeURIComponent(distributorId)}/removal-requests`,
      payload,
      { context: internalApiContext() },
    );
  }

  removalRequests(filters: RiskFilters = {}): Observable<RiskContractCollectionResponse> {
    return this.http.get<RiskContractCollectionResponse>('/delinquency/removal-requests', {
      context: internalApiContext(),
      params: riskParams(filters),
    });
  }

  removalRequest(
    removalRequestId: string,
    filters: RiskFilters = {},
  ): Observable<RiskContractResourceResponse> {
    return this.http.get<RiskContractResourceResponse>(
      `/delinquency/removal-requests/${encodeURIComponent(removalRequestId)}`,
      { context: internalApiContext(), params: riskParams(filters) },
    );
  }

  approveRemoval(
    removalRequestId: string,
    payload: RiskDecisionRequest,
  ): Observable<RiskContractResourceResponse> {
    return this.http.post<RiskContractResourceResponse>(
      `/delinquency/removal-requests/${encodeURIComponent(removalRequestId)}/approve`,
      payload,
      { context: internalApiContext() },
    );
  }

  rejectRemoval(
    removalRequestId: string,
    payload: RiskDecisionRequest,
  ): Observable<RiskContractResourceResponse> {
    return this.http.post<RiskContractResourceResponse>(
      `/delinquency/removal-requests/${encodeURIComponent(removalRequestId)}/reject`,
      payload,
      { context: internalApiContext() },
    );
  }
}

function riskParams(filters: RiskFilters) {
  return toHttpParams({
    branch_id: filters.branch_id,
    coordinator_id: filters.coordinator_id,
    distributor_id: filters.distributor_id,
    financially_regularized: filters.financially_regularized,
    consecutive_breaches: filters.consecutive_breaches,
    detected_from: filters.detected_from,
    detected_to: filters.detected_to,
    per_page: filters.per_page,
  });
}
