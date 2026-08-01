import { ConfigurationVersionDto } from '../dtos/configuration.dto';
import { ConfigurationVersion } from '../../models/configuration.model';

export function mapConfigurationVersionDtoToModel(dto: ConfigurationVersionDto): ConfigurationVersion {
  return {
    publicId: dto.public_id,
    key: dto.key,
    type: dto.type,
    value: dto.value,
    status: dto.status,
    versionNumber: dto.version_number,
    effectiveFrom: dto.effective_from,
    effectiveTo: dto.effective_to,
    actor: dto.actor,
    lockVersion: dto.lock_version,
  };
}
