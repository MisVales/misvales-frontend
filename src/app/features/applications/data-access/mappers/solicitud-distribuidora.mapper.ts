import { SolicitudDistribuidoraResponseDTO, PaginacionResponseDTO } from '../dtos/solicitud-distribuidora-response.dto';
import { SolicitudDistribuidora, PaginacionRespuesta } from '../../models/solicitud-distribuidora.model';

export class SolicitudDistribuidoraMapper {
  
  static mapToModel(response: any): SolicitudDistribuidora {
    if (!response) return null as any;
    const dto: SolicitudDistribuidoraResponseDTO = response.data ? response.data : response;
    const completion = dto.completion ?? (dto as any).progress;
    return {
      id: dto.id,
      folio: dto.application_number,
      estado: dto.status,
      sucursalId: dto.branch_id ?? dto.branch?.id ?? '',
      coordinadorId: dto.coordinator_id ?? dto.coordinator?.id ?? '',
      sucursal: dto.branch ? { id: dto.branch.id, nombre: dto.branch.name } : undefined,
      coordinador: dto.coordinator ? { id: dto.coordinator.id, nombre: dto.coordinator.name } : undefined,
      solicitante: (dto.applicant && (dto.applicant.full_name || dto.applicant.first_name)) ? {
        id: dto.applicant.id ?? '',
        nombre: dto.applicant.first_name || '',
        apellidoPaterno: dto.applicant.first_last_name || '',
        apellidoMaterno: dto.applicant.second_last_name || '',
        curpEnmascarada: dto.applicant.curp_masked || '',
        nombreCompleto: dto.applicant.full_name ?? [dto.applicant.first_name, dto.applicant.first_last_name, dto.applicant.second_last_name].filter(Boolean).join(' ')
      } : null,
      datosPersonales: dto.personal_data ?? null,
      declaracionesSeccion: {
        datosPersonales: dto.section_declarations?.personal_data,
        domicilios: dto.section_declarations?.residence,
        pareja: dto.section_declarations?.partner,
        hijos: dto.section_declarations?.children,
        referenciasFamiliares: dto.section_declarations?.family_references,
        vehiculos: dto.section_declarations?.vehicles,
        bienes: dto.section_declarations?.assets,
        pasivos: dto.section_declarations?.liabilities,
        empleos: dto.section_declarations?.employment,
        creditosComerciales: dto.section_declarations?.commercial_credits
      },
      avance: {
        seccionesCompletadas: completion?.completed_sections ?? 0,
        seccionesTotales: completion?.total_sections ?? 0,
        puedeEnviarse: completion?.can_submit ?? false
      },
      versionBloqueo: dto.lock_version,
      enviadaPor: dto.submitted_by ?? null,
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
