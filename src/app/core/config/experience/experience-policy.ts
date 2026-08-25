import type { DeviceContext, ExperienceDecision } from './experience.models';
import { resolveRoleExperience } from './role-experience.resolver';

export function evaluateExperiencePolicy(
  roles: readonly string[],
  device: DeviceContext,
): ExperienceDecision {
  const roleResolution = resolveRoleExperience(roles);

  if (roleResolution.kind === 'denied') {
    return { kind: 'denied', reason: roleResolution.reason, device };
  }

  return { kind: 'allowed', requiredExperience: roleResolution.experience, device };
}
