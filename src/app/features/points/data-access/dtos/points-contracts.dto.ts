import { ApiPaginationLinks, ApiPaginationMeta } from '@core/api/api-response.models';

export interface ContractResourceResponse {
  readonly data: unknown;
}

export interface NullableContractResourceResponse {
  readonly data: unknown | null;
}

export interface ContractResourceCollectionResponse {
  readonly data: readonly unknown[];
  readonly links: ApiPaginationLinks;
  readonly meta: ApiPaginationMeta;
}

export interface PointLedgerFilters {
  readonly per_page?: number;
  readonly relation_id?: string;
  readonly date_from?: string;
  readonly date_to?: string;
}

export interface PointsRunFilters {
  readonly page?: number;
  readonly per_page?: number;
}

export interface PointRedemptionDecisionRequest {
  readonly reauthentication_token: string;
  readonly reason: string | null;
}
