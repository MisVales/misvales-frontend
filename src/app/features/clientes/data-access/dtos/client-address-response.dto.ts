export interface ClientAddressResponseDto {
  id: string;
  street: string;
  exterior_number: string;
  interior_number: string | null;
  neighborhood: string;
  zip_code: string;
  city: string;
  municipality: string;
  state: string;
  country: string;
  valid_from: string;
}
