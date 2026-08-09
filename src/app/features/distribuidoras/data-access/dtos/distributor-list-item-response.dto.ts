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
  distributor_number: string;
  full_name: string;
  status: 'PENDING_ACTIVATION' | 'ACTIVE' | 'DISABLED';
  activation_status: 'INVITED' | 'PENDING_ACTIVATION' | 'ACTIVE' | 'BLOCKED' | 'DISABLED';
  branch: {
    id: string;
    name: string;
  };
  coordinator: {
    id: string;
    name: string;
  } | null;
  category: DistributorCategoryAssignmentResponseDto | null;
  created_at?: string | null;
  activated_at?: string | null;
  lock_version: number;
}
