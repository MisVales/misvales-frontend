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

  // La presentación la determina el rol. Temporalmente no bloqueamos el
  // acceso por dispositivo ni por viewport para permitir pruebas cruzadas.
  return { kind: 'allowed', requiredExperience: roleResolution.experience, device };
}
