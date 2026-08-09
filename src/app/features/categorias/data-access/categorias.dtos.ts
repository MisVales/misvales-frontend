export interface CategoryDto {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  profit_margin: string; // percentage as string
  is_base_category: boolean;
  created_at: string; // ISO 8601
  lock_version: number;
}

export interface CategoryListResponseDto {
  data: CategoryDto[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface CreateCategoryRequestDto {
  name: string;
  description: string | null;
  profit_margin: string; // "15.0"
}

export interface UpdateCategoryRequestDto {
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  profit_margin: string; // "15.0"
  lock_version: number;
}

// Modelos internos
export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string | null;
  estado: 'ACTIVE' | 'INACTIVE';
  margenGanancia: string;
  esCategoriaBase: boolean;
  fechaCreacion: string;
  versionRegistro: number;
}
