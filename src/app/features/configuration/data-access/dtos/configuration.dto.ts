export type ConfigurationValueType =
  | 'integer'
  | 'money'
  | 'percentage'
  | 'time'
  | 'timezone'
  | 'typed_object';

export interface ConfigurationVersionDto {
  public_id?: string;
  key: string;
  type: ConfigurationValueType;
  value: any;
  status: 'DRAFT' | 'PUBLISHED' | 'INACTIVE';
  version_number?: number;
  effective_from?: string;
  effective_to?: string;
  actor?: string;
  lock_version?: number;
}
