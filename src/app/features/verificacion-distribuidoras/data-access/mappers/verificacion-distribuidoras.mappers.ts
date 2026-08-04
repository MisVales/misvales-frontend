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
    tipo: dto.tipo,
    nombreOriginal: dto.nombre_original,
    fechaCarga: dto.fecha_carga,
    cargadoPor: dto.cargado_por
  };
}

export function mapVisitaToModel(dto: VisitaVerificacionResponseDto): VisitaVerificacion {
  return {
    id: dto.id,
    solicitudId: dto.solicitud_id,
    verificadorId: dto.verificador_id,
    estado: dto.estado as EstadoVisitaVerificacion,
    resultadoFisico: (dto.resultado_fisico as ResultadoVisitaVerificacion) || null,
    observacionesGenerales: dto.observaciones_generales,
    fechaAsignacion: dto.fecha_asignacion,
    fechaInicio: dto.fecha_inicio,
    fechaFin: dto.fecha_fin,
    diferencias: dto.diferencias?.map((d: any) => ({
      id: d.id,
      seccion: d.seccion,
      campo: d.campo,
      datoDeclarado: d.dato_declarado,
      datoObservado: d.dato_observado,
      descripcion: d.descripcion
    })) || [],
    evidencias: dto.evidencias?.map(mapEvidenciaToModel) || [],
    lockVersion: dto.lock_version
  };
}

export function mapCorreccionToModel(dto: CorreccionSolicitudResponseDto): CorreccionSolicitud {
  return {
    id: dto.id,
    seccion: dto.seccion,
    campo: dto.campo,
    valorOriginal: dto.valor_original,
    valorObservado: dto.valor_observado,
    valorCorregido: dto.valor_corregido,
    motivo: dto.motivo,
    corregidoPor: dto.corregido_por,
    fechaCorreccion: dto.fecha_correccion
  };
}

export function mapEvaluacionToModel(dto: EvaluacionSolicitudResponseDto): EvaluacionSolicitud {
  return {
    id: dto.id,
    coordinadorId: dto.coordinador_id,
    dictamen: dto.dictamen as 'COMPLIES' | 'DOES_NOT_COMPLY',
    motivo: dto.motivo,
    fechaEvaluacion: dto.fecha_evaluacion
  };
}

export function mapAutorizacionToModel(dto: AutorizacionSolicitudResponseDto): AutorizacionSolicitud {
  return {
    id: dto.id,
    gerenteId: dto.gerente_id,
    decision: dto.decision as 'APPROVED' | 'REJECTED',
    motivo: dto.motivo,
    lineaInicialDecimal: dto.linea_inicial,
    fechaAutorizacion: dto.fecha_autorizacion
  };
}

export function mapSolicitudToModel(dto: SolicitudDistribuidoraResponseDto): SolicitudDistribuidora {
  return {
    id: dto.id,
    folio: dto.folio,
    aspirante: {
      nombreCompleto: dto.aspirante.nombre_completo,
      curpEnmascarado: dto.aspirante.curp_enmascarado,
      rfcEnmascarado: dto.aspirante.rfc_enmascarado,
    },
    sucursal: dto.sucursal,
    coordinadorId: dto.coordinador_id,
    estado: dto.estado as EstadoSolicitudDistribuidora,
    fechaEnvio: dto.fecha_envio,
    avance: dto.avance,
    visitas: dto.visitas?.map(mapVisitaToModel) || [],
    correcciones: dto.correcciones?.map(mapCorreccionToModel) || [],
    evaluacion: dto.evaluacion ? mapEvaluacionToModel(dto.evaluacion) : null,
    autorizacion: dto.autorizacion ? mapAutorizacionToModel(dto.autorizacion) : null,
    datosDeclarados: dto.datos_declarados || {},
    lockVersion: dto.lock_version
  };
}
