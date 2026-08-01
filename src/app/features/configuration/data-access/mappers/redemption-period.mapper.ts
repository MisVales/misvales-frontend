import { RedemptionPeriodDto } from '../dtos/redemption-period.dto';
import { RedemptionPeriod } from '../../models/redemption-period.model';

export function mapRedemptionPeriodDtoToModel(dto: RedemptionPeriodDto): RedemptionPeriod {
  return {
    publicId: dto.public_id,
    name: dto.name,
    description: dto.description,
    startsAt: dto.starts_at,
    endsAt: dto.ends_at,
    reason: dto.reason,
    status: dto.status,
    actor: dto.actor,
    lockVersion: dto.lock_version,
  };
}
