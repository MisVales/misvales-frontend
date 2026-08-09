export interface ProductDto {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  status: 'ACTIVE' | 'INACTIVE';
  category_id: string;
  base_price: string;
  current_price: string;
  created_at: string;
  lock_version: number;
}

export interface ProductListResponseDto {
  data: ProductDto[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface CreateProductRequestDto {
  name: string;
  description: string | null;
  sku: string;
  category_id: string;
  base_price: string;
}

export interface UpdateProductRequestDto {
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  category_id: string;
  base_price: string;
  lock_version: number;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  sku: string;
  estado: 'ACTIVE' | 'INACTIVE';
  categoriaId: string;
  precioBase: string;
  precioActual: string;
  fechaCreacion: string;
  versionRegistro: number;
}
