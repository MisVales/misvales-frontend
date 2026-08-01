import { ApiPaginationLinks, ApiPaginationMeta } from '@core/api/api-response.models';

export interface ReportingContractResourceResponse {
  readonly data: unknown;
}

export interface ReportingContractCollectionResponse {
  readonly data: readonly unknown[];
  readonly links: ApiPaginationLinks;
  readonly meta: ApiPaginationMeta;
}

export type ReportDirection = 'asc' | 'desc';
export type ReportFilterValue = boolean | number | string | null;

export interface ReportExecutionQuery {
  readonly page?: number;
  readonly per_page?: number;
  readonly sort?: string;
  readonly direction?: ReportDirection;
  readonly filters?: Readonly<Record<string, ReportFilterValue>>;
}

export interface ReportRunQuery {
  readonly page?: number;
  readonly per_page?: number;
}

export type ReportRunRequest = Readonly<Record<string, ReportFilterValue>>;
