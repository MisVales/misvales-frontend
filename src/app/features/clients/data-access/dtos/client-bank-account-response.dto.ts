export interface ClientBankAccountResponseDto {
  id: string;
  bank_name: string;
  account_holder_name: string;
  account_number_masked: string | null;
  clabe_masked: string;
  is_current: boolean;
  starts_at: string;
  ends_at: string | null;
  change_reason: string | null;
  lock_version: number;
}
