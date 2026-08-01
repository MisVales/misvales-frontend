export interface ProductVersionDto {
  public_id?: string;
  version_public_id?: string;
  amount: string;
  loan_commission_rate: string;
  interest_rate_per_fortnight: string;
  insurance_amount: string;
  fortnight_count: number;
  status: 'DRAFT' | 'PUBLISHED' | 'INACTIVE';
  version_number?: number;
  effective_from?: string;
  effective_to?: string;
  actor?: string;
  lock_version?: number;
}
