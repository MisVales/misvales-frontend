import {
  ConfiguracionDefinicion,
  ConfiguracionVersion,
  ConfigurationDefinitionDto,
  ConfigurationVersionDto,
} from './configuraciones.dtos';

export class ConfiguracionesMapper {
  static fromDefinitionDto(dto: ConfigurationDefinitionDto): ConfiguracionDefinicion {
    return {
      id: dto.id,
      clave: dto.key,
      nombre: dto.name,
      descripcion: dto.description,
      tipoValor: dto.value_type,
      unidad: dto.unit,
      requerida: dto.is_required,
      sensible: dto.is_sensitive,
      estado: dto.status,
      versionRegistro: dto.lock_version,
      valorActual: dto.versions?.[0]?.value ?? null,
    };
  }

  static fromVersionDto(dto: ConfigurationVersionDto): ConfiguracionVersion {
    return {
      id: dto.id,
      definicionId: dto.configuration_definition_id,
      numero: dto.version,
      valor: dto.value,
      estado: dto.status,
      inicioVigencia: dto.effective_from,
      finVigencia: dto.effective_to,
      motivo: dto.reason,
      usuarioResponsable: dto.published_by ?? dto.created_by,
      fechaPublicacion: dto.published_at,
      fechaCreacion: dto.created_at,
      versionRegistro: dto.lock_version,
    };
  }
}
