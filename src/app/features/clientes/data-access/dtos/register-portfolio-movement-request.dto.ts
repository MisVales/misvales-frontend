export interface RegisterPortfolioMovementRequestDto {
  type: string;
  amount: string;
  concept: string;
  lock_version: number;
}
