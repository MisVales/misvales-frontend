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

  const requiredExperience = roleResolution.experience;

  if (device.detectedClass === 'unknown' || device.confidence === 'low') {
    return {
      kind: 'unsupported',
      requiredExperience,
      reason: 'unknown_device',
      device,
    };
  }

  if (device.detectedClass !== requiredExperience) {
    return {
      kind: 'unsupported',
      requiredExperience,
      reason: 'device_mismatch',
      device,
    };
  }

  if (!device.viewportViability[requiredExperience]) {
    return {
      kind: 'unsupported',
      requiredExperience,
      reason: 'viewport_incompatible',
      device,
    };
  }

  return { kind: 'allowed', requiredExperience, device };
}
