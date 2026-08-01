export interface CategoryVersionDto {
  public_id?: string; // Identity
  version_public_id?: string; // Version
  name: string;
  description: string;
  distributor_profit_rate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'INACTIVE';
  version_number?: number;
  effective_from?: string;
  effective_to?: string;
  actor?: string;
  lock_version?: number;
}
