import { ProductVersionDto } from '../dtos/product.dto';
import { ProductVersion } from '../../models/product.model';

export function mapProductVersionDtoToModel(dto: ProductVersionDto): ProductVersion {
  return {
    publicId: dto.public_id,
    versionPublicId: dto.version_public_id,
    amount: dto.amount,
    loanCommissionRate: dto.loan_commission_rate,
    interestRatePerFortnight: dto.interest_rate_per_fortnight,
    insuranceAmount: dto.insurance_amount,
    fortnightCount: dto.fortnight_count,
    status: dto.status,
    versionNumber: dto.version_number,
    effectiveFrom: dto.effective_from,
    effectiveTo: dto.effective_to,
    actor: dto.actor,
    lockVersion: dto.lock_version,
  };
}
