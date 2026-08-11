export interface CreateClientPortfolioEntryRequestDto {
  entry_type:'DEBT'|'PAYMENT'|'PARTIAL_PAYMENT'|'STATUS_UPDATE'|'NOTE'|'ADJUSTMENT_INCREASE'|'ADJUSTMENT_DECREASE';
  amount:string|null; informational_status:'PENDING'|'PARTIALLY_PAID'|'PAID'|null;
  occurred_at:string; due_date:string|null; last_payment_at:string|null; note:string|null; related_voucher_id:null;
}
