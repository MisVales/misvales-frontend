import { VersionStatus } from './base.model';

export interface ProductVersion {
  publicId?: string;
  versionPublicId?: string;
  amount: string;
  loanCommissionRate: string;
  interestRatePerFortnight: string;
  insuranceAmount: string;
  fortnightCount: number;
  status: VersionStatus;
  versionNumber?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  actor?: string;
  lockVersion?: number;
}
