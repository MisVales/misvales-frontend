export interface CategoryDto {
  id: string;
  version_id: string;
  code: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  profit_margin: string;
  version_status: 'DRAFT' | 'PUBLISHED' | 'INACTIVE';
  effective_from: string;
  reason: string;
  created_at: string;
  lock_version: number;
}

export interface CategoryListResponseDto { data: CategoryDto[]; meta: { current_page: number; last_page: number; total: number }; }
export interface CreateCategoryRequestDto { code: string; name: string; description: string | null; profit_percentage: string; reason: string; }
export interface UpdateCategoryRequestDto { name: string; description: string | null; profit_percentage: string; reason: string; lock_version: number; }

export interface Categoria {
  id: string; versionId: string; codigo: string; nombre: string; descripcion: string | null; estado: 'ACTIVE' | 'INACTIVE'; margenGanancia: string;
  estadoVersion: 'DRAFT' | 'PUBLISHED' | 'INACTIVE'; vigenciaDesde: string; motivo: string; fechaCreacion: string; versionRegistro: number;
}
