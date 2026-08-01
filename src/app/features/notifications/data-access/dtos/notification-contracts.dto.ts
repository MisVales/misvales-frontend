import { ApiPaginationLinks, ApiPaginationMeta } from '@core/api/api-response.models';

export type NotificationStatus = 'READ' | 'UNREAD';

export interface NotificationContractResourceResponse {
  readonly data: unknown;
}

export interface NotificationContractCollectionResponse {
  readonly data: readonly unknown[];
  readonly links: ApiPaginationLinks;
  readonly meta: ApiPaginationMeta;
}
