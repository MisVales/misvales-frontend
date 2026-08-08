export interface CreateClientBankAccountRequestDto {
  bank_name: string;
  account_holder: string;
  clabe: string;
  account_number?: string;
  reason: string;
}
