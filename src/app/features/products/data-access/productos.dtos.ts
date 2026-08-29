export interface ProductDto {
  id: string; version_id: string; code: string; name: string; description: string | null;
  status: 'ACTIVE' | 'INACTIVE'; nominal_amount: string;
  loan_commission_percentage?: string | null;
  simple_interest_percentage?: string | null;
  insurance_amount?: string | null;
  fortnights_count?: number | null;
  late_fee_amount?: string | null;
  version_status: string; effective_from: string; reason: string;
  created_at: string; lock_version: number;
}
export interface ProductListResponseDto { data: ProductDto[]; meta: { current_page: number; last_page: number; total: number; }; }
export interface CreateProductRequestDto {
  code: string; name: string; description: string | null; nominal_amount: string; reason: string;
  loan_commission_percentage?: string | null;
  simple_interest_percentage?: string | null;
  insurance_amount?: string | null;
  fortnights_count?: number | null;
  late_fee_amount?: string | null;
}
export interface UpdateProductRequestDto {
  name: string; description: string | null; nominal_amount: string; reason: string; lock_version: number;
  loan_commission_percentage?: string | null;
  simple_interest_percentage?: string | null;
  insurance_amount?: string | null;
  fortnights_count?: number | null;
  late_fee_amount?: string | null;
}
export interface Producto {
  id: string; versionId: string; estadoVersion: string; nombre: string; descripcion: string | null; sku: string; estado: 'ACTIVE' | 'INACTIVE'; categoriaId: string; precioBase: string; precioActual: string; fechaCreacion: string; versionRegistro: number;
  loanCommissionPercentage?: string | null;
  simpleInterestPercentage?: string | null;
  insuranceAmount?: string | null;
  fortnightsCount?: number | null;
  lateFeeAmount?: string | null;
}
