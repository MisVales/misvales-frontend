export interface ConfigurationDefinitionDto {
  key: string;
  name: string;
  group: string;
  value_type: 'integer' | 'monetary' | 'percentage' | 'time' | 'timezone' | 'duration' | 'date' | 'time_range' | 'controlled_text';
  current_value: string | null;
}

export interface ConfigurationVersionDto {
  id: string;
  configuration_key: string;
  value: string; // strictly string
  status: 'DRAFT' | 'PUBLISHED' | 'INACTIVE';
  effective_from: string; // ISO 8601 with timezone
  effective_until: string | null;
  reason: string | null;
  responsible_user: string;
  published_at: string | null;
  created_at: string;
  lock_version: number;
}

export interface ConfigurationListResponseDto {
  data: ConfigurationDefinitionDto[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface ConfigurationVersionListResponseDto {
  data: ConfigurationVersionDto[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface CreateConfigurationVersionRequestDto {
  value: string;
  effective_from: string;
  reason: string;
}

export interface UpdateConfigurationVersionRequestDto {
  value: string;
  effective_from: string;
  reason: string;
  lock_version: number; // passed in body or header
}

// Modelos internos (camelCase)
export interface ConfiguracionDefinicion {
  clave: string;
  nombre: string;
  grupo: string;
  tipoValor: string;
  valorActual: string | null;
}

export interface ConfiguracionVersion {
  id: string;
  claveConfiguracion: string;
  valor: string;
  estado: 'DRAFT' | 'PUBLISHED' | 'INACTIVE';
  inicioVigencia: string;
  finVigencia: string | null;
  motivo: string | null;
  usuarioResponsable: string;
  fechaPublicacion: string | null;
  fechaCreacion: string;
  versionRegistro: number;
}
