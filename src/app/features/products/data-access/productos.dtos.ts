export interface ProductDto {
  id: string; version_id: string; code: string; name: string; description: string | null;
  status: 'ACTIVE' | 'INACTIVE'; nominal_amount: string;
  version_status: string; effective_from: string; reason: string;
  created_at: string; lock_version: number;
}
export interface ProductListResponseDto { data: ProductDto[]; meta: { current_page: number; last_page: number; total: number; }; }
export interface CreateProductRequestDto { code: string; name: string; description: string | null; nominal_amount: string; reason: string; }
export interface UpdateProductRequestDto { name: string; description: string | null; nominal_amount: string; reason: string; lock_version: number; }
export interface Producto { id: string; versionId: string; estadoVersion: string; nombre: string; descripcion: string | null; sku: string; estado: 'ACTIVE' | 'INACTIVE'; categoriaId: string; precioBase: string; precioActual: string; fechaCreacion: string; versionRegistro: number; }
