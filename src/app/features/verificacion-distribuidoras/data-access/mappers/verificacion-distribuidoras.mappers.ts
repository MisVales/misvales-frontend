import { 
  AutorizacionSolicitudResponseDto,
  CorreccionSolicitudResponseDto,
  EvaluacionSolicitudResponseDto,
  EvidenciaVerificacionResponseDto,
  SolicitudDistribuidoraResponseDto, 
  VisitaVerificacionResponseDto 
} from '../dtos/verificacion-distribuidoras.dtos';
import { 
  AutorizacionSolicitud,
  CorreccionSolicitud,
  EstadoSolicitudDistribuidora, 
  EstadoVisitaVerificacion, 
  EvaluacionSolicitud, 
  EvidenciaVerificacion, 
  ResultadoVisitaVerificacion, 
  SolicitudDistribuidora,
  VisitaVerificacion
} from '../../models/verificacion-distribuidoras.models';

export function mapEvidenciaToModel(dto: EvidenciaVerificacionResponseDto): EvidenciaVerificacion {
  return {
    id: dto.id,
    tipo: dto.file_type,
    nombreOriginal: dto.original_name,
    mimeType: dto.mime_type,
    fechaCarga: dto.created_at,
    cargadoPor: dto.uploaded_by,
    urlDescarga: dto.download_url,
  };
}

export function mapVisitaToModel(dto: VisitaVerificacionResponseDto): VisitaVerificacion {
  return {
    id: dto.id,
    solicitudId: dto.application_id,
    verificadorId: dto.verifier_id,
    estado: dto.status as EstadoVisitaVerificacion,
    resultadoFisico: (dto.result as ResultadoVisitaVerificacion) || null,
    observacionesGenerales: dto.observations,
    fechaAsignacion: dto.assigned_at,
    fechaInicio: dto.started_at,
    fechaFin: dto.completed_at,
    diferencias: dto.differences_payload?.items?.map((d: any) => ({
      id: d.id,
      seccion: d.section,
      campo: d.field,
      datoDeclarado: d.declared_value,
      datoObservado: d.observed_value,
      descripcion: d.description
    })) || [],
    evidencias: dto.media_files?.map(mapEvidenciaToModel) || [],
    lockVersion: dto.lock_version
  };
}

export function mapCorreccionToModel(dto: CorreccionSolicitudResponseDto): CorreccionSolicitud {
  return {
    id: dto.id,
    seccion: dto.section,
    campo: dto.field_path,
    valorOriginal: '',
    valorObservado: '',
    valorCorregido: '',
    motivo: dto.reason,
    corregidoPor: dto.corrected_by,
    fechaCorreccion: dto.corrected_at,
  };
}

export function mapEvaluacionToModel(dto: EvaluacionSolicitudResponseDto): EvaluacionSolicitud {
  return {
    id: dto.id,
    coordinadorId: dto.coordinador_id,
    dictamen: dto.dictamen,
    motivo: dto.motivo,
    fechaEvaluacion: dto.fecha_evaluacion,
  };
}

export function mapAutorizacionToModel(dto: AutorizacionSolicitudResponseDto): AutorizacionSolicitud {
  return {
    id: dto.id,
    gerenteId: dto.authorized_by,
    decision: dto.decision as 'APPROVED' | 'REJECTED',
    motivo: dto.reason,
    lineaInicialDecimal: dto.initial_credit_line_amount,
    fechaAutorizacion: dto.authorized_at,
  };
}

export function mapSolicitudToModel(dto: SolicitudDistribuidoraResponseDto): SolicitudDistribuidora {
  const avance = typeof dto.completion === 'number'
    ? dto.completion
    : dto.completion?.total_sections
      ? Math.round((dto.completion.completed_sections / dto.completion.total_sections) * 100)
      : 0;

  return {
    id: dto.id,
    folio: dto.application_number,
    aspirante: {
      nombreCompleto: dto.applicant.full_name || '',
      curpEnmascarado: dto.applicant.curp_masked || '',
      rfcEnmascarado: String(dto.personal_data?.['rfc_masked'] ?? ''),
    },
    sucursal: { id: dto.branch.id, nombre: dto.branch.name || '' },
    coordinadorId: dto.coordinator.id,
    estado: dto.status as EstadoSolicitudDistribuidora,
    fechaEnvio: dto.submitted_at || '',
    avance,
    visitas: dto.verification_visits?.map(mapVisitaToModel) || [],
    correcciones: dto.corrections?.map(mapCorreccionToModel) || [],
    evaluaciones: dto.evaluations?.map(mapEvaluacionToModel) || [],
    ultimaEvaluacion: dto.latest_evaluation ? mapEvaluacionToModel(dto.latest_evaluation) : null,
    autorizacion: dto.authorization ? mapAutorizacionToModel(dto.authorization) : null,
    datosDeclarados: {
      personal_data: sanitizarDatosDeclarados(dto.personal_data ?? null),
      family_members: sanitizarDatosDeclarados(dto.family_members ?? []),
      residences: sanitizarDatosDeclarados(dto.residences ?? []),
      vehicles: sanitizarDatosDeclarados(dto.vehicles ?? []),
      assets_liabilities: sanitizarDatosDeclarados(dto.assets_liabilities ?? []),
      employments: sanitizarDatosDeclarados(dto.employments ?? []),
      commercial_credits: sanitizarDatosDeclarados(dto.commercial_credits ?? []),
    },
    lockVersion: dto.lock_version
  };
}

function sanitizarDatosDeclarados(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizarDatosDeclarados);
  if (!value || typeof value !== 'object') return value;

  const ocultos = new Set(['curp', 'rfc', 'official_id_number']);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !ocultos.has(key))
      .map(([key, nested]) => [key, sanitizarDatosDeclarados(nested)]),
  );
}
