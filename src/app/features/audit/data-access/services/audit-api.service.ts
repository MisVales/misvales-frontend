import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { internalApiContext } from '@core/api/api-request.context';
import { toHttpParams } from '@core/api/query-params.util';

import {
  AuditContractCollectionResponse,
  AuditContractResourceResponse,
  AuditFilters,
} from '../dtos/audit-contracts.dto';

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private readonly http = inject(HttpClient);

  events(filters: AuditFilters = {}): Observable<AuditContractCollectionResponse> {
    return this.http.get<AuditContractCollectionResponse>('/audit/events', {
      context: internalApiContext(),
      params: toHttpParams({
        branch_id: filters.branch_id,
        requester_user_id: filters.requester_user_id,
        authorizer_user_id: filters.authorizer_user_id,
        executor_user_id: filters.executor_user_id,
        subject_id: filters.subject_id,
        subject_public_number: filters.subject_public_number,
        request_id: filters.request_id,
        trace_id: filters.trace_id,
        correlation_id: filters.correlation_id,
        date_from: filters.date_from,
        date_to: filters.date_to,
        per_page: filters.per_page,
      }),
    });
  }

  event(auditEventId: string): Observable<AuditContractResourceResponse> {
    return this.http.get<AuditContractResourceResponse>(
      `/audit/events/${encodeURIComponent(auditEventId)}`,
      { context: internalApiContext() },
    );
  }
}
