import { ApiPaginationLinks, ApiPaginationMeta } from '@core/api/api-response.models';

export interface AuditContractResourceResponse {
  readonly data: unknown;
}

export interface AuditContractCollectionResponse {
  readonly data: readonly unknown[];
  readonly links: ApiPaginationLinks;
  readonly meta: ApiPaginationMeta;
}

export interface AuditFilters {
  readonly branch_id?: string;
  readonly requester_user_id?: string;
  readonly authorizer_user_id?: string;
  readonly executor_user_id?: string;
  readonly subject_id?: string;
  readonly subject_public_number?: string;
  readonly request_id?: string;
  readonly trace_id?: string;
  readonly correlation_id?: string;
  readonly date_from?: string;
  readonly date_to?: string;
  readonly per_page?: number;
}
