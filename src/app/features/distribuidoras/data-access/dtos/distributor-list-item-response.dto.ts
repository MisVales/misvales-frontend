export interface DistributorCategoryAssignmentResponseDto {
  id: string;
  name: string;
  description: string;
  profit_percentage: string;
  starts_at: string;
  ends_at: string | null;
  assigned_by_id: string;
  reason: string | null;
  status: 'ACTIVE' | 'HISTORIC';
}

export interface DistributorListItemResponseDto {
  id: string;
  number: string;
  full_name: string;
  status: 'PENDING_ACTIVATION' | 'ACTIVE' | 'DISABLED';
  access_status: 'INVITED' | 'PENDING_ACTIVATION' | 'ACTIVE' | 'BLOCKED' | 'DISABLED';
  branch: {
    id: string;
    name: string;
  };
  coordinator: {
    id: string;
    full_name: string;
  } | null;
  category: DistributorCategoryAssignmentResponseDto | null;
  initial_credit_limit: string | null;
  initial_credit_restriction_active: boolean;
  created_at: string;
  activated_at: string | null;
  lock_version: number;
}
