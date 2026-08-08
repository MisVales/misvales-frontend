import { PaginationMeta } from '../../../core/api/models/api.dtos';

export type UserState = 'INVITED' | 'PENDING_ACTIVATION' | 'ACTIVE' | 'BLOCKED' | 'DISABLED';

export interface UserListFilterReq {
  search?: string;
  state?: UserState;
  role_id?: string;
  branch_id?: string;
  page?: number;
}

export interface RoleScopeRes {
  role: { name: string };
  branch_id?: string;
}

export interface UserRes {
  id: string;
  name: string;
  email: string;
  state: UserState;
  mfa_status?: boolean;
  role_scopes?: RoleScopeRes[];
}

export interface UserListRes {
  data: UserRes[];
  current_page: number;
  total: number;
}

export interface UserCreateReq {
  name: string;
  email: string;
  role_id: string;
  branch_id: string | null;
  send_invitation: boolean;
}

export interface UserUpdateReq {
  name?: string;
}

export interface UserAssignmentReq {
  role_id: string;
  branch_id?: string | null;
}

export interface UserAssignmentRes {
  id: string;
  role: { id: string; name: string };
  branch?: { id: string; name: string } | null;
  assignedBy?: { id: string; name: string };
  created_at?: string;
}

export interface RoleRes {
  id: string;
  name: string;
  is_mutable?: boolean;
  permissions: string[];
}
