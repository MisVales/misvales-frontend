export interface UpdateClientPortfolioEntryRequestDto {
  note?: string;
  informational_status?: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | null;
  lock_version: number;
}
