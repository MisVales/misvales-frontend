import { ClientListItemResponseDto } from './client-list-item-response.dto';

export interface ClientDetailResponseDto extends ClientListItemResponseDto {
  first_name: string;
  first_last_name: string;
  second_last_name: string | null;
  curp?: string;
  rfc_masked: string | null;
  rfc?: string | null;
  birth_place: string;
  birth_state: string;
  birth_city: string;
  official_id_type: string;
  official_id_number_masked: string | null;
  official_id_number?: string | null;
  address_history: Array<Record<string, unknown>>;
  bank_account_history: Array<Record<string, unknown>>;
  assignment_history: Array<{ id: string; distributor_id: string; branch_id: string; starts_at: string; ends_at: string | null; reason: string | null }>;
}
