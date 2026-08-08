export interface Scope {
  branchId: string;
  branchName: string;
  role: string;
}

export interface MeRes {
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
    layoutPreference?: 'desktop' | 'tablet' | 'mobile';
  };
  scopes: Scope[];
  effective_permissions: string[];
  activeBranch?: string;
}
