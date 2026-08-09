export interface ClientListItemResponseDto {
  id: string;
  client_number: string;
  full_name: string;
  curp_masked: string;
  birth_date: string;
  address: ClientAddressSummaryDto | null;
  bank_account: ClientBankSummaryDto | null;
  branch: { id: string; name: string } | null;
  distributor: { id: string; distributor_number: string } | null;
  portfolio_summary: { current_balance: string; informational_status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | null };
  lock_version: number;
  created_at: string;
}

export interface ClientAddressSummaryDto {
  street: string; exterior_number: string; interior_number: string | null; neighborhood: string;
  postal_code: string; municipality: string; city: string; state: string; country: string;
}

export interface ClientBankSummaryDto {
  bank_name: string; account_holder_name: string; clabe_masked: string;
}
