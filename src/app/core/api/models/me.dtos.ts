export interface Scope {
  branch_id: string | null;
  role_name: string;
  role: string;
  permissions: string[];
}

export interface MeRes {
  user: {
    id: string;
    name: string;
    email: string;
    state: string;
  };
  scopes: Scope[];
  effective_permissions: string[];
}
