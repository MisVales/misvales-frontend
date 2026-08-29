export interface DevolverSolicitudCapturaRequestDto {
  motivo: string;
  seccionesPendientes: string[];
  lock_version: number;
}

export interface AsignarVerificadorRequestDto {
  verifier_id: string;
  scheduled_for: string;
  lock_version: number;
}

export interface AgendaVerificadorDto {
  id: string;
  scheduled_for: string;
  reserved_from: string;
  reserved_until: string;
  status: string;
  application_number: string | null;
}

export interface IniciarVisitaRequestDto {
  lock_version: number;
}

export interface ActualizarVisitaRequestDto {
  observaciones_generales?: string;
  diferencias?: {
    seccion: string;
    campo: string;
    dato_declarado: string;
    dato_observado: string;
    descripcion: string;
    registro_id?: string;
    registro_nombre?: string;
  }[];
  lock_version: number;
}

export interface AdjuntarEvidenciaRequestDto {
  tipo: string;
  file: File;
  lock_version: number;
}

export interface FinalizarVisitaRequestDto {
  resultado_fisico: 'FAVORABLE' | 'UNFAVORABLE';
  observaciones?: string;
  lock_version: number;
}

export interface AplicarCorreccionRequestDto {
  visit_id: string;
  seccion: string;
  campo: string;
  valor_original: string;
  valor_observado: string;
  valor_corregido?: string;
  motivo?: string;
  lock_version: number;
  record_id?: string;
  difference_index: number;
}

export interface FinalizarCorreccionesRequestDto {
  lock_version: number;
  force?: boolean;
}

export interface EvaluarSolicitudRequestDto {
  visit_id: string;
  dictamen: 'COMPLIES' | 'DOES_NOT_COMPLY';
  motivo: string;
  lock_version: number;
}

export interface AutorizarSolicitudRequestDto {
  decision: 'APPROVED' | 'REJECTED';
  motivo: string;
  linea_inicial: string | null; // Como decimal en string
  lock_version: number;
}

export interface EvidenciaVerificacionResponseDto {
  id: string;
  file_type: string;
  mime_type: string;
  original_name: string;
  created_at: string;
  uploaded_by: string;
  download_url?: string;
}

export interface VisitaVerificacionResponseDto {
  id: string;
  application_id: string;
  verifier_id: string | null;
  status: string;
  result: string | null;
  observations: string | null;
  assigned_at: string | null;
  scheduled_for: string | null;
  started_at: string | null;
  completed_at: string | null;
  differences_payload: { items?: any[] } | null;
  media_files?: EvidenciaVerificacionResponseDto[];
  declared_media_files?: EvidenciaVerificacionResponseDto[];
  lock_version: number;
  application?: SolicitudDistribuidoraResponseDto;
}

export interface CorreccionSolicitudResponseDto {
  id: string;
  section: string;
  field_path: string;
  reason: string;
  corrected_by: string;
  corrected_at: string;
  target_record_id?: string | null;
  difference_index?: number | null;
  declared_value?: unknown;
  observed_value?: unknown;
  accepted_value?: unknown;
  corrected_by_name?: string | null;
}

export interface EvaluacionSolicitudResponseDto {
  id: string;
  coordinador_id: string;
  dictamen: 'COMPLIES' | 'DOES_NOT_COMPLY';
  motivo: string;
  fecha_evaluacion: string;
}

export interface AutorizacionSolicitudResponseDto {
  id: string;
  authorized_by: string;
  decision: string;
  reason: string;
  initial_credit_line_amount: string | null;
  authorized_at: string;
}

export interface SolicitudDistribuidoraResponseDto {
  id: string;
  application_number: string;
  applicant: {
    full_name: string | null;
    curp_masked: string | null;
  };
  branch: {
    id: string;
    name: string | null;
  };
  coordinator: { id: string | null; name: string | null };
  status: string;
  submitted_at: string | null;
  completion:
    | number
    | {
        completed_sections: number;
        total_sections: number;
        can_submit: boolean;
      };
  section_declarations?: Record<string, unknown>;
  personal_data?: Record<string, unknown> | null;
  family_members?: Record<string, unknown>[];
  residences?: Record<string, unknown>[];
  vehicles?: Record<string, unknown>[];
  assets_liabilities?: Record<string, unknown>[];
  employments?: Record<string, unknown>[];
  commercial_credits?: Record<string, unknown>[];
  declared_media_files?: EvidenciaVerificacionResponseDto[];
  verification_visits?: VisitaVerificacionResponseDto[];
  corrections?: CorreccionSolicitudResponseDto[];
  evaluations?: EvaluacionSolicitudResponseDto[];
  latest_evaluation?: EvaluacionSolicitudResponseDto | null;
  authorization?: AutorizacionSolicitudResponseDto | null;
  lock_version: number;
}

export interface ErrorApiResponseDto {
  error: {
    code: string;
    message: string;
    request_id?: string;
  };
}
