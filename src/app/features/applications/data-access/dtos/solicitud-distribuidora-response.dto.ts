// dtos/solicitud-distribuidora-response.dto.ts
export interface SolicitudDistribuidoraResponseDTO {
  id: string;
  application_number: string;
  status: EstadoSolicitudDistribuidoraDTO;
  branch_id: string;
  coordinator_id: string;
  applicant: ResumenSolicitanteDTO | null;
  section_declarations: DeclaracionesSeccionDTO;
  progress: AvanceExpedienteDTO;
  lock_version: number;
  submitted_by: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
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
  | 'ACTIVE';

export interface ResumenSolicitanteDTO {
  id: string;
  first_name: string;
  first_last_name: string;
  second_last_name: string;
  curp_masked: string; // The API only returns masked curp if we don't have full read permissions, or maybe just full curp? The doc says "No mostrar CURP completa. Mostrar únicamente curp_masked cuando sea entregada por la API"
}

export interface DeclaracionesSeccionDTO {
  personal_data: EstadoDeclaracionDTO;
  family_references: EstadoDeclaracionDTO;
  residences: EstadoDeclaracionDTO;
  vehicles: EstadoDeclaracionDTO;
  assets: EstadoDeclaracionDTO;
  liabilities: EstadoDeclaracionDTO;
  employments: EstadoDeclaracionDTO;
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
