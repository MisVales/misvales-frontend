export interface MeRes {
  user: {
    id: string;
    name: string;
    email: string;
    state: string;
    layoutPreference?: 'desktop' | 'tablet' | 'mobile'; // Keep for frontend state if needed
  };
  scopes: {
    role: string;
    role_name: string;
    branch_id: string | null;
    permissions: string[];
  }[];
  effective_permissions: string[];
}
