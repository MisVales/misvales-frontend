export interface ApiDataResponse<T> {
  readonly data: T;
}

export interface ApiMessageResponse {
  readonly message: string;
}

export interface ApiPaginationLinks {
  readonly prev: string | null;
  readonly next: string | null;
}

export interface ApiPaginationMeta {
  readonly current_page: number;
  readonly per_page: number;
  readonly total: number;
}

export interface ApiPaginatedResponse<T> {
  readonly data: readonly T[];
  readonly links: ApiPaginationLinks;
  readonly meta: ApiPaginationMeta;
}

export type ApiFieldErrors = Readonly<Record<string, readonly string[]>>;

export interface ApiErrorBody {
  readonly code: string;
  readonly message: string;
  readonly fields: ApiFieldErrors;
  readonly details: Readonly<Record<string, unknown>>;
  readonly request_id: string | null;
}

export interface ApiErrorEnvelope {
  readonly error: ApiErrorBody;
}

export interface NormalizedApiError extends ApiErrorBody {
  readonly status: number;
  readonly retryAfterSeconds: number | null;
  readonly offline: boolean;
}
