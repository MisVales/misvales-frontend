import { CategoryVersionDto } from '../dtos/category.dto';
import { CategoryVersion } from '../../models/category.model';

export function mapCategoryVersionDtoToModel(dto: CategoryVersionDto): CategoryVersion {
  return {
    publicId: dto.public_id,
    versionPublicId: dto.version_public_id,
    name: dto.name,
    description: dto.description,
    distributorProfitRate: dto.distributor_profit_rate,
    status: dto.status,
    versionNumber: dto.version_number,
    effectiveFrom: dto.effective_from,
    effectiveTo: dto.effective_to,
    actor: dto.actor,
    lockVersion: dto.lock_version,
  };
}
