import { describe, expect, it } from 'vitest';
import { resolveRoleExperience, ROLE_EXPERIENCE_MAP } from './role-experience.resolver';

describe('resolveRoleExperience', () => {
  it.each([
    ['general_manager', 'desktop'],
    ['branch_manager', 'desktop'],
    ['cashier', 'desktop'],
    ['admin', 'desktop'],
    ['coordinator', 'tablet'],
    ['verifier', 'tablet'],
    ['distributor', 'mobile'],
  ] as const)('maps %s to the only authorized experience', (role, experience) => {
    expect(ROLE_EXPERIENCE_MAP[role]).toBe(experience);
    expect(resolveRoleExperience([role])).toEqual({
      kind: 'resolved',
      experience,
      roles: [role],
    });
  });

  it('allows multiple roles only when all belong to the same experience', () => {
    expect(resolveRoleExperience(['general_manager', 'admin', 'cashier'])).toEqual({
      kind: 'resolved',
      experience: 'desktop',
      roles: ['general_manager', 'admin', 'cashier'],
    });
  });

  it('fails closed for no roles, unknown roles and mixed experience families', () => {
    expect(resolveRoleExperience([])).toEqual({ kind: 'denied', reason: 'no_roles' });
    expect(resolveRoleExperience(['auditor'])).toEqual({
      kind: 'denied',
      reason: 'unknown_role',
    });
    expect(resolveRoleExperience(['admin', 'coordinator'])).toEqual({
      kind: 'denied',
      reason: 'mixed_experiences',
    });
  });
});
