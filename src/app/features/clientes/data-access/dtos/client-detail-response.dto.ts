import { ClientAddressResponseDto } from './client-address-response.dto';
import { ClientBankAccountResponseDto } from './client-bank-account-response.dto';
import { ClientPortfolioSummaryResponseDto } from './client-portfolio-summary-response.dto';

export interface ClientDetailResponseDto {
  id: string;
  client_number: string;
  full_name: string;
  masked_curp: string;
  masked_rfc: string | null;
  birth_date: string;
  birth_place: string;
  active_address: ClientAddressResponseDto;
  active_bank_account: ClientBankAccountResponseDto | null;
  active_assignment: {
    distributor_id: string;
    branch_id: string;
    start_date: string;
  };
  portfolio_summary: ClientPortfolioSummaryResponseDto;
  created_at: string;
  lock_version: number;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';
}
