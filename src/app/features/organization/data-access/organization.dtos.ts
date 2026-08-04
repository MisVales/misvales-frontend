export interface BranchRes {
  id: string;
  code: string;
  name: string;
  isHeadquarters: boolean;
  isActive: boolean;
  activeStaffCount: number;
  lockVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchReq {
  code: string;
  name: string;
  isHeadquarters: boolean;
}

export interface UpdateBranchReq {
  name: string;
  isHeadquarters: boolean;
}

export interface PaginatedRes<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface AssignmentHistoryRes {
  id: string;
  role: string;
  branch: { id: string; name: string } | null;
  scopeType: 'global' | 'branch';
  startDate: string;
  endDate?: string;
  reason: string;
  assignedBy: string;
}

export interface StaffRes {
  id: string;
  userId: string;
  name: string;
  email: string;
  branch: { id: string; name: string } | null;
  effectiveRole: string;
  assignmentStatus: 'active' | 'pending' | 'revoked';
  assignments: AssignmentHistoryRes[];
}

export interface AssignStaffReq {
  userId: string;
  role: string;
  branchId: string | null; // null si es global
  scopeType: 'global' | 'branch';
  startDate: string;
  reason: string;
}
