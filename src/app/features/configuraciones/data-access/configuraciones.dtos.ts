export type ConfigurationValue =
  | string
  | number
  | boolean
  | null
  | ConfigurationValue[]
  | { [key: string]: ConfigurationValue };

export interface ApiResource<T> {
  data: T;
}

export interface ConfigurationDefinitionDto {
  id: string;
  key: string;
  name: string;
  description: string | null;
  value_type:
    | 'INTEGER'
    | 'DECIMAL'
    | 'PERCENTAGE'
    | 'TIME'
    | 'TIMEZONE'
    | 'DURATION'
    | 'DATE'
    | 'TIME_RANGE'
    | 'STRING'
    | 'JSON';
  unit: string | null;
  is_required: boolean;
  is_sensitive: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  lock_version: number;
  versions?: ConfigurationVersionDto[];
}

export interface ConfigurationVersionDto {
  id: string;
  configuration_definition_id: string;
  version: number;
  value: ConfigurationValue;
  status: 'DRAFT' | 'PUBLISHED' | 'INACTIVE';
  effective_from: string;
  effective_to: string | null;
  reason: string;
  created_by: string;
  published_by: string | null;
  published_at: string | null;
  created_at: string;
  lock_version: number;
}

export interface CreateConfigurationVersionRequestDto {
  value: ConfigurationValue;
  effective_from: string;
  reason: string;
}

export interface UpdateConfigurationVersionRequestDto
  extends CreateConfigurationVersionRequestDto {
  lock_version: number;
}

export interface ConfiguracionDefinicion {
  id: string;
  clave: string;
  nombre: string;
  descripcion: string | null;
  tipoValor: ConfigurationDefinitionDto['value_type'];
  unidad: string | null;
  requerida: boolean;
  sensible: boolean;
  estado: ConfigurationDefinitionDto['status'];
  versionRegistro: number;
  valorActual: ConfigurationValue;
}

export interface ConfiguracionVersion {
  id: string;
  definicionId: string;
  numero: number;
  valor: ConfigurationValue;
  estado: ConfigurationVersionDto['status'];
  inicioVigencia: string;
  finVigencia: string | null;
  motivo: string;
  usuarioResponsable: string;
  fechaPublicacion: string | null;
  fechaCreacion: string;
  versionRegistro: number;
}
