import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { internalApiContext } from '@core/api/api-request.context';
import { QueryParamValue, toHttpParams } from '@core/api/query-params.util';

import {
  ReportExecutionQuery,
  ReportingContractCollectionResponse,
  ReportingContractResourceResponse,
  ReportRunQuery,
  ReportRunRequest,
} from '../dtos/reporting-contracts.dto';

const RESERVED_REPORT_PARAMS = new Set(['direction', 'page', 'per_page', 'sort']);

@Injectable({ providedIn: 'root' })
export class ReportingApiService {
  private readonly http = inject(HttpClient);

  catalog(): Observable<ReportingContractCollectionResponse> {
    return this.http.get<ReportingContractCollectionResponse>('/reports', {
      context: internalApiContext(),
    });
  }

  definition(code: string): Observable<ReportingContractResourceResponse> {
    return this.http.get<ReportingContractResourceResponse>(
      `/reports/${encodeURIComponent(code)}/definition`,
      { context: internalApiContext() },
    );
  }

  execute(
    code: string,
    query: ReportExecutionQuery = {},
  ): Observable<ReportingContractCollectionResponse> {
    return this.http.get<ReportingContractCollectionResponse>(
      `/reports/${encodeURIComponent(code)}`,
      {
        context: internalApiContext(),
        params: reportExecutionParams(query),
      },
    );
  }

  createRun(
    code: string,
    payload: ReportRunRequest,
    idempotencyKey: string,
  ): Observable<ReportingContractResourceResponse> {
    return this.http.post<ReportingContractResourceResponse>(
      `/reports/${encodeURIComponent(code)}/runs`,
      payload,
      {
        context: internalApiContext(),
        headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }),
      },
    );
  }

  runs(query: ReportRunQuery = {}): Observable<ReportingContractCollectionResponse> {
    return this.http.get<ReportingContractCollectionResponse>('/report-runs', {
      context: internalApiContext(),
      params: toHttpParams({ page: query.page, per_page: query.per_page }),
    });
  }

  run(runId: string): Observable<ReportingContractResourceResponse> {
    return this.http.get<ReportingContractResourceResponse>(
      `/report-runs/${encodeURIComponent(runId)}`,
      { context: internalApiContext() },
    );
  }

  runResults(
    runId: string,
    query: ReportRunQuery = {},
  ): Observable<ReportingContractCollectionResponse> {
    return this.http.get<ReportingContractCollectionResponse>(
      `/report-runs/${encodeURIComponent(runId)}/results`,
      {
        context: internalApiContext(),
        params: toHttpParams({ page: query.page, per_page: query.per_page }),
      },
    );
  }
}

function reportExecutionParams(query: ReportExecutionQuery): HttpParams {
  const dynamicFilters = Object.fromEntries(
    Object.entries(query.filters ?? {})
      .filter(([name]) => name.length > 0 && !RESERVED_REPORT_PARAMS.has(name))
      .sort(([left], [right]) => left.localeCompare(right)),
  ) as Readonly<Record<string, QueryParamValue>>;

  return toHttpParams({
    page: query.page,
    per_page: query.per_page,
    sort: query.sort,
    direction: query.direction,
    ...dynamicFilters,
  });
}
