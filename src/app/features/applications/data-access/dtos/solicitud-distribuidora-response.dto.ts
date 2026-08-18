// dtos/solicitud-distribuidora-response.dto.ts
export interface SolicitudDistribuidoraResponseDTO {
  id: string;
  application_number: string;
  status: EstadoSolicitudDistribuidoraDTO;
  branch_id?: string;
  coordinator_id?: string;
  branch?: { id: string; name: string };
  coordinator?: { id: string; name: string };
  applicant: ResumenSolicitanteDTO | null;
  personal_data?: PersonalDataDTO | null;
  section_declarations: DeclaracionesSeccionDTO;
  progress?: AvanceExpedienteDTO;
  completion?: AvanceExpedienteDTO;
  lock_version: number;
  submitted_by?: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonalDataDTO extends ResumenSolicitanteDTO {
  first_name: string;
  first_last_name: string;
  nationality: 'MEXICAN' | 'FOREIGN';
  birth_country: string;
  birth_date: string;
  birth_state: string;
  birth_city: string;
  email: string;
  phone_number: string;
  identification_country?: string | null;
  official_id_type: string;
  official_id_number?: string | null;
  has_identification_evidence?: boolean;
  rfc?: string | null;
}

export type EstadoSolicitudDistribuidoraDTO = 
  | 'DRAFT'
  | 'COORDINATOR_REVIEW'
  | 'VERIFIER_ASSIGNED'
  | 'PHYSICAL_VERIFICATION'
  | 'COORDINATOR_CORRECTION'
  | 'COORDINATOR_EVALUATION'
  | 'MANAGER_AUTHORIZATION'
  | 'TERMINATED_UNFAVORABLE'
  | 'REJECTED'
  | 'AUTHORIZED_PENDING_ACTIVATION'
  | 'ACTIVE';

export interface ResumenSolicitanteDTO {
  id?: string;
  first_name?: string;
  first_last_name?: string;
  second_last_name?: string;
  curp_masked: string; // The API only returns masked curp if we don't have full read permissions, or maybe just full curp? The doc says "No mostrar CURP completa. Mostrar únicamente curp_masked cuando sea entregada por la API"
  full_name?: string;
}

export interface DeclaracionesSeccionDTO {
  personal_data: EstadoDeclaracionDTO;
  residence: EstadoDeclaracionDTO;
  partner: EstadoDeclaracionDTO;
  children: EstadoDeclaracionDTO;
  family_references: EstadoDeclaracionDTO;
  vehicles: EstadoDeclaracionDTO;
  assets: EstadoDeclaracionDTO;
  liabilities: EstadoDeclaracionDTO;
  employment: EstadoDeclaracionDTO;
  commercial_credits: EstadoDeclaracionDTO;
}

export type EstadoDeclaracionDTO = 'PENDING' | 'COMPLETED' | 'NOT_APPLICABLE';

export interface AvanceExpedienteDTO {
  completed_sections: number;
  total_sections: number;
  can_submit: boolean;
}

export interface PaginacionResponseDTO<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
