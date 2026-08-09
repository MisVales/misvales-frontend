import { PortfolioEntryType } from './client-portfolio-entry-response.dto';
export interface CreateClientPortfolioEntryRequestDto {
  entry_type: PortfolioEntryType; amount?: string | null; informational_status?: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | null;
  occurred_at: string; due_date?: string | null; last_payment_at?: string | null; note?: string | null;
}
