import { ApiPaginationLinks, ApiPaginationMeta } from '@core/api/api-response.models';

export interface RiskContractResourceResponse {
  readonly data: unknown;
}

export interface RiskContractCollectionResponse {
  readonly data: readonly unknown[];
  readonly links: ApiPaginationLinks;
  readonly meta: ApiPaginationMeta;
}

export interface RiskFilters {
  readonly branch_id?: string;
  readonly coordinator_id?: string;
  readonly distributor_id?: string;
  readonly financially_regularized?: boolean;
  readonly consecutive_breaches?: number;
  readonly detected_from?: string;
  readonly detected_to?: string;
  readonly per_page?: number;
}

export interface RiskDecisionRequest {
  readonly reauthentication_token: string;
  readonly reason: string | null;
}

export interface RemovalPreparationRequest {
  readonly reason: string | null;
}
