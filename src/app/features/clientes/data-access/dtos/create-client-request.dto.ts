export interface CreateClientRequestDto {
  first_name:string; first_last_name:string; second_last_name:string|null; curp:string; rfc:string|null;
  birth_date:string; birth_place:string; birth_state:string; birth_city:string;
  official_id_type:'INE'|'PASSPORT'|'PROFESSIONAL_LICENSE'|'OTHER'; official_id_number:string|null; official_id_media_id?:string|null;
  address:{street:string;exterior_number:string;interior_number:string|null;neighborhood:string;postal_code:string;municipality:string;city:string;state:string;country:string;address_proof_media_id?:string|null};
  bank_account:{bank_name:string;account_holder_name:string;account_number:string|null;clabe:string|null};
}
