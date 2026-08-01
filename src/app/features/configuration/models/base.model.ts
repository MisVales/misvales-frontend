export type VersionStatus = 'DRAFT' | 'PUBLISHED' | 'INACTIVE';

export interface PaginatedResult<T> {
  data: {
    result: T[];
  }[];
  links: {
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
  };
}

export interface SingleResult<T> {
  data: {
    result: T;
  };
}
