export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedRes<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface DataRes<T> {
  data: T;
  message?: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string | null;
  lat?: number | null;
  lng?: number | null;
  is_headquarters: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  has_branch_manager?: boolean;
  lock_version: number;
  active_personnel_count?: number;
  created_at?: string;
  updated_at?: string | null;
}

export interface CreateBranchPayload {
  name: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
}

export interface UpdateBranchPayload {
  name: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  lock_version: number;
}

export interface PersonnelAssignment {
  assignment_id: string;
  user: {
    id: string;
    name: string;
    email: string;
    state: string;
  };
  role: { id: string; code: string; name: string };
  branch_id: string | null;
  scope: 'GLOBAL' | 'BRANCH';
  assignment_status: 'ACTIVE' | 'ENDED' | 'REVOKED';
  assigned_at: string;
  assignment_reason: string | null;
  revoked_at: string | null;
  revocation_reason: string | null;
}

export interface UserAssignment {
  id: string;
  user_id: string;
  role_id: string;
  branch_id: string | null;
  scope_type: 'GLOBAL' | 'BRANCH';
  status: 'ACTIVE' | 'ENDED' | 'REVOKED';
  assigned_at: string;
  assignment_reason: string | null;
  revoked_at: string | null;
  revocation_reason: string | null;
  role: { id: string; code: string; name: string };
  branch: { id: string; code: string; name: string } | null;
}

export interface AssignPersonnelPayload {
  role_id: string;
  branch_id: string | null;
  scope?: 'GLOBAL' | 'BRANCH';
  assigned_at?: string;
  assignment_reason?: string | null;
}

export interface CoordinatorDistributorAssignment {
  id: string;
  coordinator_id: string;
  distributor_id: string;
  branch_id: string;
  valid_from: string;
  valid_to: string | null;
  status: 'ACTIVE' | 'REASSIGNED' | 'ENDED';
  assignment_reason: string | null;
  end_reason: string | null;
  coordinator: { id: string; name: string; email?: string };
  distributor: {
    id: string;
    distributor_number: string;
    full_name: string | null;
    status: string;
    branch_id: string;
  } | null;
}

export interface AssignCoordinatorDistributorPayload {
  coordinator_id: string;
  distributor_id: string;
  branch_id: string;
  assignment_reason?: string | null;
}

export interface DistributorCandidate {
  id: string;
  distributor_number: string;
  status: string;
  branch: { id: string; name?: string };
  coordinator: { id: string; name: string | null };
  applicant: { full_name: string | null } | null;
}
