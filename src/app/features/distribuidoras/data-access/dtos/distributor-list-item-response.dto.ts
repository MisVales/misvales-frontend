export interface DistributorCategoryAssignmentResponseDto {
  id: string;
  category_version_id?: string;
  category?: { id: string; name: string; version: number; profit_rate: string } | null;
  name?: string;
  description?: string;
  profit_percentage?: string;
  profit_rate?: string;
  starts_at: string;
  ends_at: string | null;
  assigned_by?: string;
  assigned_by_id?: string;
  reason: string | null;
  status?: 'ACTIVE' | 'HISTORIC';
}

export interface DistributorListItemResponseDto {
  id: string;
  distributor_number: string;
  full_name: string;
  status: 'PENDING_ACTIVATION' | 'ACTIVE' | 'DISABLED';
  activation_status: 'INVITED' | 'PENDING_ACTIVATION' | 'ACTIVE' | 'BLOCKED' | 'DISABLED' | null;
  branch: {
    id: string;
    name: string;
  } | null;
  coordinator: {
    id: string;
    name: string;
  } | null;
  category: ({ id: string; version_id?: string; name: string; profit_rate: string } & Partial<DistributorCategoryAssignmentResponseDto>) | null;
  initial_credit?: { total_authorized: string; used_balance: string; available_balance: string } | null;
  initial_restriction?: { status: string } | null;
  created_at?: string;
  activated_at?: string | null;
  lock_version: number;
}
