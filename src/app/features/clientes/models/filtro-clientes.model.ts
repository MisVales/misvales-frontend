export interface FiltroClientes {
  search?: string;
  branchId?: string;
  distributorId?: string;
  status?: string;
  hasBalance?: boolean;
  page?: number;
  perPage?: number;
}
