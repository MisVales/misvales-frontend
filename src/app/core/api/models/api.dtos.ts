export interface ApiErrorRes {
  code: string; // ej. 'VALIDATION_ERROR', 'AUTH_SCOPE_DENIED'
  message: string;
  errors?: Record<string, string[]>; // Para errores 422
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}
