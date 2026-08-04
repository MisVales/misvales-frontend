export interface MeRes {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  activeBranch?: string; // ID de la sucursal activa
  layoutPreference?: 'desktop' | 'tablet' | 'mobile';
}
