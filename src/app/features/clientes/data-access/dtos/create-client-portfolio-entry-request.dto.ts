export interface CreateClientPortfolioEntryRequestDto {
  type: 'CHARGE' | 'PAYMENT' | 'NOTE' | 'ADJUSTMENT' | 'STATUS_UPDATE';
  amount: string | null;
  concept: string;
}
