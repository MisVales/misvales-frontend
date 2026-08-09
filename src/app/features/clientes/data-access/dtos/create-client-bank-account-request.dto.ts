export interface CreateClientBankAccountRequestDto {
  bank_name: string;
  account_holder_name: string;
  clabe: string;
  account_number?: string;
  change_reason: string;
  lock_version: number;
}
