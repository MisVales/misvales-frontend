export interface CreateClientRequestDto {
  first_name: string;
  last_name_1: string;
  last_name_2: string;
  curp: string;
  rfc: string;
  birth_date: string;
  birth_place: string;
  official_id: string;
  address: {
    street: string;
    exterior_number: string;
    interior_number: string | null;
    neighborhood: string;
    zip_code: string;
    city: string;
    municipality: string;
    state: string;
    country: string;
  };
  bank_account?: {
    bank_name: string;
    account_holder: string;
    clabe: string;
    account_number?: string;
  };
}
