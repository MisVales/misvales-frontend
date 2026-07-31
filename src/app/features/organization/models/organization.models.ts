export type OrganizationResource =
  'assignments' | 'branches' | 'permissions' | 'roles' | 'scopes' | 'users';

export interface OrganizationRecord {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly status: string;
  readonly detail: Readonly<Record<string, string>>;
}

export interface OrganizationUserOption {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly roleCode: string | null;
  readonly branchId: string | null;
}

export interface BranchOption {
  readonly id: string;
  readonly name: string;
}

export interface RoleOption {
  readonly id: number;
  readonly name: string;
  readonly code: string;
}

export interface CreateScopeRequest {
  readonly user_public_id: string;
  readonly role_id: number;
  readonly scope_type: 'BRANCH' | 'GLOBAL';
  readonly branch_public_id: string | null;
}

export interface CreateAssignmentRequest {
  readonly distributor_public_id: string;
  readonly coordinator_public_id: string;
  readonly branch_public_id: string;
  readonly starts_at: string;
  readonly ends_at: string | null;
  readonly reason: string | null;
}

export interface UpdateAssignmentRequest {
  readonly ends_at: string | null;
  readonly reason: string | null;
}
