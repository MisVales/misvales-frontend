export type PortfolioEntryType = 'DEBT' | 'PAYMENT' | 'PARTIAL_PAYMENT' | 'STATUS_UPDATE' | 'NOTE' | 'ADJUSTMENT_INCREASE' | 'ADJUSTMENT_DECREASE';
export interface ClientPortfolioEntryResponseDto {
  id: string; client_id: string; entry_type: PortfolioEntryType; amount: string | null;
  informational_status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | null;
  occurred_at: string; due_date: string | null; last_payment_at: string | null; note: string | null;
  related_voucher_id: string | null; recorded_by: string; lock_version: number;
}
