export interface Branch {
  id: string;
  code: string;
  name: string;
  is_headquarters: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  lock_version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBranchPayload {
  code: string;
  name: string;
}

export interface UpdateBranchPayload {
  name: string;
}

export interface UpdateBranchStatusPayload {
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PersonnelAssignment {
  id: string;
  user_id: string;
  role_id: string;
  branch_id: string;
  status: 'ACTIVE' | 'ENDED';
  user: any; // Ajustar según modelo de User final
  role: { code: string; name: string };
}

export interface AssignPersonnelPayload {
  user_id: string;
  role_code: string;
}

export interface RemovePersonnelPayload {
  reason?: string;
}

export interface CoordinatorDistributorAssignment {
  id: string;
  coordinator_id: string;
  distributor_id: string;
  status: 'ACTIVE' | 'REASSIGNED' | 'ENDED';
  coordinator: any; // Ajustar según modelo de Coordinator final
}

export interface AssignCoordinatorDistributorPayload {
  coordinator_id: string;
  distributor_id: string;
  branch_id: string;
  assignment_reason?: string;
}

export interface TerminateCoordinatorDistributorPayload {
  end_reason: string;
}

// Re-export PaginatedRes from here for backwards compatibility if needed in UI, or wait, it's not in the spec but UI might use it.
export interface PaginatedRes<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}
