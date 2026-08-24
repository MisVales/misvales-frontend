import type {
  ExperienceType,
  RoleCode,
  RoleExperienceResolution,
} from './experience.models';
import { ROLE_CODES } from './experience.models';

export const ROLE_EXPERIENCE_MAP: Readonly<Record<RoleCode, ExperienceType>> = {
  general_manager: 'desktop',
  branch_manager: 'desktop',
  cashier: 'desktop',
  admin: 'desktop',
  coordinator: 'tablet',
  verifier: 'tablet',
  distributor: 'mobile',
};

const KNOWN_ROLES = new Set<string>(ROLE_CODES);

export function isRoleCode(role: string): role is RoleCode {
  return KNOWN_ROLES.has(role);
}

export function resolveRoleExperience(roles: readonly string[]): RoleExperienceResolution {
  const uniqueRoles = Array.from(new Set(roles));

  if (uniqueRoles.length === 0) {
    return { kind: 'denied', reason: 'no_roles' };
  }

  if (uniqueRoles.some((role) => !isRoleCode(role))) {
    return { kind: 'denied', reason: 'unknown_role' };
  }

  const knownRoles = uniqueRoles as RoleCode[];
  const experiences = new Set(knownRoles.map((role) => ROLE_EXPERIENCE_MAP[role]));

  if (experiences.size !== 1) {
    return { kind: 'denied', reason: 'mixed_experiences' };
  }

  return {
    kind: 'resolved',
    experience: experiences.values().next().value as ExperienceType,
    roles: knownRoles,
  };
}
