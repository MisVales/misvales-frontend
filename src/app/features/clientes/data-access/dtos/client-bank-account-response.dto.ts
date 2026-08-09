export interface ClientBankAccountResponseDto {
  id: string;
  bank_name: string;
  account_holder: string;
  masked_account_number: string | null;
  masked_clabe: string;
  valid_from: string;
}
