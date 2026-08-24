import { describe, expect, it } from 'vitest';
import { organizationRoutes } from './organization.routes';

describe('organizationRoutes', () => {
  it('mantiene los redirects libres de canActivate para que Angular pueda cargar el módulo', () => {
    const children = organizationRoutes[0]?.children ?? [];
    const redirects = children.filter((route) => route.redirectTo);

    expect(redirects.length).toBeGreaterThan(0);
    expect(redirects.every((route) => !route.canActivate?.length)).toBe(true);
  });

  it('protege el listado de sucursales con branches.view', () => {
    const branches = organizationRoutes[0]?.children?.find((route) => route.path === 'sucursales');

    expect(branches?.canActivate?.length).toBe(1);
    expect(branches?.loadComponent).toBeTypeOf('function');
  });
});
