export interface ExchangePeriodDto {
  id: string;
  name: string;
  start_date: string; // ISO 8601
  end_date: string; // ISO 8601
  status: 'SCHEDULED' | 'ACTIVE' | 'CLOSED';
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
  name: string;
  start_date: string;
  end_date: string;
}

export interface UpdateExchangePeriodRequestDto {
  name: string;
  start_date: string;
  end_date: string;
  lock_version: number;
}

export interface PeriodoCanje {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'SCHEDULED' | 'ACTIVE' | 'CLOSED';
  fechaCreacion: string;
  versionRegistro: number;
}
