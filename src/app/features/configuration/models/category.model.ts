import { VersionStatus } from './base.model';

export interface CategoryVersion {
  publicId?: string;
  versionPublicId?: string;
  name: string;
  description: string;
  distributorProfitRate: string;
  status: VersionStatus;
  versionNumber?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  actor?: string;
  lockVersion?: number;
}
