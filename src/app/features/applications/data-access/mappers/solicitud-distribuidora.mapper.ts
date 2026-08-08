import { SolicitudDistribuidoraResponseDTO, PaginacionResponseDTO } from '../dtos/solicitud-distribuidora-response.dto';
import { SolicitudDistribuidora, PaginacionRespuesta } from '../../models/solicitud-distribuidora.model';

export class SolicitudDistribuidoraMapper {
  
  static mapToModel(dto: SolicitudDistribuidoraResponseDTO): SolicitudDistribuidora {
    return {
      id: dto.id,
      folio: dto.application_number,
      estado: dto.status,
      sucursalId: dto.branch_id,
      coordinadorId: dto.coordinator_id,
      solicitante: dto.applicant ? {
        id: dto.applicant.id,
        nombre: dto.applicant.first_name,
        apellidoPaterno: dto.applicant.first_last_name,
        apellidoMaterno: dto.applicant.second_last_name,
        curpEnmascarada: dto.applicant.curp_masked
      } : null,
      declaracionesSeccion: {
        datosPersonales: dto.section_declarations.personal_data,
        referenciasFamiliares: dto.section_declarations.family_references,
        domicilios: dto.section_declarations.residences,
        vehiculos: dto.section_declarations.vehicles,
        bienes: dto.section_declarations.assets,
        pasivos: dto.section_declarations.liabilities,
        empleos: dto.section_declarations.employments,
        creditosComerciales: dto.section_declarations.commercial_credits
      },
      avance: {
        seccionesCompletadas: dto.progress.completed_sections,
        seccionesTotales: dto.progress.total_sections,
        puedeEnviarse: dto.progress.can_submit
      },
      versionBloqueo: dto.lock_version,
      enviadaPor: dto.submitted_by,
      enviadaEn: dto.submitted_at,
      creadaEn: dto.created_at,
      actualizadaEn: dto.updated_at
    };
  }

  static mapToPaginationModel<T, U>(dto: PaginacionResponseDTO<T>, mapFn: (item: T) => U): PaginacionRespuesta<U> {
    return {
      datos: dto.data.map(mapFn),
      paginaActiva: dto.meta.current_page,
      ultimaPagina: dto.meta.last_page,
      porPagina: dto.meta.per_page,
      total: dto.meta.total
    };
  }
}
