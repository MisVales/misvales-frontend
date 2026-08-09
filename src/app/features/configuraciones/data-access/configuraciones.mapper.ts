import { ConfiguracionDefinicion, ConfiguracionVersion, ConfigurationDefinitionDto, ConfigurationVersionDto } from './configuraciones.dtos';

export class ConfiguracionesMapper {
  
  static fromDefinitionDto(dto: ConfigurationDefinitionDto): ConfiguracionDefinicion {
    return {
      clave: dto.key,
      nombre: dto.name,
      grupo: dto.group,
      tipoValor: dto.value_type,
      valorActual: dto.current_value
    };
  }

  static fromVersionDto(dto: ConfigurationVersionDto): ConfiguracionVersion {
    return {
      id: dto.id,
      claveConfiguracion: dto.configuration_key,
      valor: dto.value,
      estado: dto.status,
      inicioVigencia: dto.effective_from,
      finVigencia: dto.effective_until,
      motivo: dto.reason,
      usuarioResponsable: dto.responsible_user,
      fechaPublicacion: dto.published_at,
      fechaCreacion: dto.created_at,
      versionRegistro: dto.lock_version
    };
  }
}
