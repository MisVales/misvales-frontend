export interface ClientPortfolioSummaryResponseDto {
  current_balance: string;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'NO_RECORDS';
  last_payment_date: string | null;
  total_entries: number;
  has_overdue_entries: boolean;
  is_zero_balance_for_transfer: boolean;
}
