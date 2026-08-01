import { ConfigurationValueType, ConfigurationVersionDto } from '../data-access/dtos/configuration.dto';
import { VersionStatus } from './base.model';

export interface ConfigurationVersion {
  publicId?: string;
  key: string;
  type: ConfigurationValueType;
  value: any;
  status: VersionStatus;
  versionNumber?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  actor?: string;
  lockVersion?: number;
}
