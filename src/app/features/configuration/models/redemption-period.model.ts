import { VersionStatus } from './base.model';

export interface RedemptionPeriod {
  publicId?: string;
  name: string;
  description: string;
  startsAt: string;
  endsAt: string;
  reason: string;
  status: VersionStatus;
  actor?: string;
  lockVersion?: number;
}
