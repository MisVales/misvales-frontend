export interface ExchangePeriodDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  start_date: string; // ISO 8601
  end_date: string; // ISO 8601
  status: 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'CANCELLED';
  created_at: string;
  lock_version: number;
}

export interface ExchangePeriodListResponseDto {
  data: ExchangePeriodDto[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface CreateExchangePeriodRequestDto {
  code: string;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  reason: string;
}

export interface UpdateExchangePeriodRequestDto {
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  reason: string;
  lock_version: number;
}

export interface PeriodoCanje {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'CANCELLED';
  fechaCreacion: string;
  versionRegistro: number;
}
