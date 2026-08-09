export interface ClientPortfolioEntryResponseDto {
  id: string;
  date: string;
  type: 'CHARGE' | 'PAYMENT' | 'NOTE' | 'ADJUSTMENT' | 'STATUS_UPDATE';
  amount: string | null;
  concept: string;
  new_balance: string | null;
  registered_by: string;
}
