export interface ClientListItemResponseDto {
  id: string;
  client_number: string;
  full_name: string;
  masked_curp: string;
  distributor_id: string;
  branch_id: string;
  portfolio_summary: {
    current_balance: string;
    status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | null;
    last_payment_date: string | null;
  };
  created_at: string;
}
