import { mapEffectiveContext } from './context-contract.gateway';

describe('auth context contract', () => {
  const base = {
    user: {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'usuario@example.test',
      displayName: 'Usuario de prueba',
      status: 'ACTIVE',
    },
    role: { code: 'GENERAL_MANAGER', name: 'Gerente general' },
    scope: { type: 'GLOBAL', branchId: null },
    permissions: ['auth.context.read', 'accounts.global.create'],
    experience: { code: 'ADMIN', layout: 'desktop', homeRoute: '/administracion/inicio' },
    session: {
      id: '00000000-0000-4000-8000-000000000002',
      authenticatedAt: '2026-07-30T12:00:00-06:00',
      assuranceLevel: 'PASSWORD_MFA',
      reauthenticatedUntil: null,
    },
    contextVersion: 1,
  } as const;

  it.each([
    ['ADMIN', 'administrativa'],
    ['TABLET', 'tableta'],
    ['DISTRIBUTOR_MOBILE', 'distribuidora'],
  ] as const)('maps %s to the authorized Angular experience', (code, experience) => {
    const mapped = mapEffectiveContext({
      ...base,
      experience: { ...base.experience, code },
    });

    expect(mapped.experience).toBe(experience);
    expect(mapped.role).toBe('GENERAL_MANAGER');
    expect(mapped.permissions.has('accounts.global.create')).toBe(true);
    expect(mapped.identity?.displayName).toBe('Usuario de prueba');
  });

  it('rejects an incomplete response instead of establishing a partial session', () => {
    expect(() => mapEffectiveContext({ user: {}, permissions: [] })).toThrow(
      'INVALID_AUTH_CONTEXT_RESPONSE',
    );
  });
});
