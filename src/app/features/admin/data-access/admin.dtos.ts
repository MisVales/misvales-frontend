import { PaginationMeta } from '../../../core/api/models/api.dtos';

export type UserState = 'INVITED' | 'PENDING_ACTIVATION' | 'ACTIVE' | 'BLOCKED' | 'DISABLED';

export interface UserListFilterReq {
  search?: string;
  state?: UserState;
  role_id?: string;
  branch_id?: string;
  page?: number;
  per_page?: number;
}

export interface RoleScopeRes {
  role: { id?: string; code?: string; name: string };
  branch_id?: string | null;
  branch?: { id: string; code: string; name: string } | null;
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
  role_id?: string;
  branch_id?: string | null;
  send_invitation: boolean;
}

export interface UserCreateRes {
  message: string;
  user: UserRes;
}

export interface AdminMessageRes {
  message: string;
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

export interface UserAssignmentCommandRes extends AdminMessageRes {
  assignment?: UserAssignmentRes;
}

export interface RoleRes {
  id: string;
  code: string;
  name: string;
  description?: string;
  default_scope?: 'GLOBAL' | 'BRANCH' | 'ASSIGNED';
  is_system?: boolean;
  is_active?: boolean;
}
