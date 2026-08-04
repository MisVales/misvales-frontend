import { PaginationMeta } from '../../../core/api/models/api.dtos';

export interface UserListFilterReq {
  status?: 'active' | 'blocked' | 'invited';
  role?: string;
  branch?: string;
}

export interface UserRes {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'blocked' | 'invited';
  roles: string[];
  branchId?: string;
}

export interface UserListRes {
  data: UserRes[];
  meta: PaginationMeta;
}

export interface UserInviteReq {
  email: string;
  roles: string[];
  branchId?: string;
}

export interface UserStatusUpdateReq {
  status: 'active' | 'blocked';
}

export interface RoleRes {
  id: string;
  name: string;
  permissions: string[];
}
