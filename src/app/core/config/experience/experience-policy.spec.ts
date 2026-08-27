import { describe, expect, it } from 'vitest';
import type { DeviceClass, DeviceContext, ExperienceType, RoleCode } from './experience.models';
import { EXPERIENCE_TYPES } from './experience.models';
import { evaluateExperiencePolicy } from './experience-policy';
import { ROLE_EXPERIENCE_MAP } from './role-experience.resolver';

const ROLES = Object.keys(ROLE_EXPERIENCE_MAP) as RoleCode[];
const MATRIX = ROLES.flatMap((role) =>
  EXPERIENCE_TYPES.map((device) => [role, device] as const),
);

function context(detectedClass: DeviceClass): DeviceContext {
  return {
    viewportWidth: 1440,
    viewportHeight: 900,
    screenWidth: 1440,
    screenHeight: 900,
    orientation: 'landscape',
    pointer: 'fine',
    anyPointer: 'fine',
    hover: true,
    anyHover: true,
    touch: false,
    maxTouchPoints: 0,
    userAgentData: { mobile: false, platform: 'Windows' },
    userAgent: 'Windows',
    detectedClass,
    confidence: detectedClass === 'unknown' ? 'low' : 'high',
    viewportViability: { desktop: true, tablet: true, mobile: true },
  };
}

describe('evaluateExperiencePolicy', () => {
  it.each(MATRIX)(
    'only allows the device assigned to %s when detected as %s',
    (role, device) => {
      const decision = evaluateExperiencePolicy([role], context(device));
      expect(decision).toMatchObject(
        device === ROLE_EXPERIENCE_MAP[role]
          ? { kind: 'allowed', requiredExperience: ROLE_EXPERIENCE_MAP[role] }
          : { kind: 'unsupported', requiredExperience: ROLE_EXPERIENCE_MAP[role], reason: 'device_mismatch' },
      );
    },
  );

  it('blocks the assigned experience when its viewport is not viable', () => {
    const device = context('desktop');
    device.viewportViability.desktop = false;

    expect(evaluateExperiencePolicy(['admin'], device)).toMatchObject({ kind: 'unsupported', reason: 'viewport_incompatible', requiredExperience: 'desktop' satisfies ExperienceType });
  });

  it('keeps unknown devices separate from role-context denial', () => {
    expect(evaluateExperiencePolicy(['admin'], context('unknown'))).toMatchObject({ kind: 'unsupported', reason: 'unknown_device', requiredExperience: 'desktop' });
    expect(evaluateExperiencePolicy(['admin', 'coordinator'], context('desktop'))).toEqual({
      kind: 'denied',
      reason: 'mixed_experiences',
      device: context('desktop'),
    });
  });
});
