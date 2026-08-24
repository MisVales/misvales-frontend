export interface PortfolioMovementResponseDto {
  id: string;
  client_id: string;
  type: string;
  amount: string;
  previous_balance: string;
  new_balance: string;
  concept: string;
  registered_at: string;
  registered_by: string;
}
