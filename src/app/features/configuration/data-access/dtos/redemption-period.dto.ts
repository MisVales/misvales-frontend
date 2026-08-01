export interface RedemptionPeriodDto {
  public_id?: string;
  name: string;
  description: string;
  starts_at: string;
  ends_at: string;
  reason: string;
  status: 'DRAFT' | 'PUBLISHED' | 'INACTIVE';
  actor?: string;
  lock_version?: number;
}
