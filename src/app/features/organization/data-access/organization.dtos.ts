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
