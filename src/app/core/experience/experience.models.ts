export const EXPERIENCE_TYPES = ['desktop', 'tablet', 'mobile'] as const;

export type ExperienceType = (typeof EXPERIENCE_TYPES)[number];
export type DeviceClass = ExperienceType | 'unknown';
export type DeviceConfidence = 'high' | 'medium' | 'low';
export type DeviceOrientation = 'portrait' | 'landscape';
export type PointerCapability = 'fine' | 'coarse' | 'none';

export const ROLE_CODES = [
  'general_manager',
  'branch_manager',
  'cashier',
  'admin',
  'coordinator',
  'verifier',
  'distributor',
] as const;

export type RoleCode = (typeof ROLE_CODES)[number];

export interface UserAgentDataSignals {
  mobile: boolean | null;
  platform: string | null;
}

export interface DeviceSignals {
  viewportWidth: number;
  viewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  orientation: DeviceOrientation;
  pointer: PointerCapability;
  anyPointer: PointerCapability;
  hover: boolean;
  anyHover: boolean;
  touch: boolean;
  maxTouchPoints: number;
  userAgentData: UserAgentDataSignals;
  userAgent: string;
}

export interface ViewportViability {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

export interface DeviceContext extends DeviceSignals {
  detectedClass: DeviceClass;
  confidence: DeviceConfidence;
  viewportViability: ViewportViability;
}

export type RoleExperienceDenialReason =
  | 'no_roles'
  | 'unknown_role'
  | 'mixed_experiences';

export type RoleExperienceResolution =
  | { kind: 'resolved'; experience: ExperienceType; roles: readonly RoleCode[] }
  | { kind: 'denied'; reason: RoleExperienceDenialReason };

export type ExperienceBlockReason =
  | 'unknown_device'
  | 'device_mismatch'
  | 'viewport_incompatible';

export type ExperienceDecision =
  | {
      kind: 'allowed';
      requiredExperience: ExperienceType;
      device: DeviceContext;
    }
  | {
      kind: 'unsupported';
      requiredExperience: ExperienceType;
      reason: ExperienceBlockReason;
      device: DeviceContext;
    }
  | {
      kind: 'denied';
      reason: RoleExperienceDenialReason;
      device: DeviceContext;
    };

