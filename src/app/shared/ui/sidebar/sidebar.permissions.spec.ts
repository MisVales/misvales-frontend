import { describe, expect, it } from 'vitest';
import { NAV_GROUPS, type NavItemData } from './sidebar.config';
import { filterNavigationItems } from './sidebar.permissions';

function collectIds(items: readonly NavItemData[]): string[] {
  return items.flatMap((item) => [item.id, ...collectIds(item.children ?? [])]);
}

function collectItems(items: readonly NavItemData[]): NavItemData[] {
  return items.flatMap((item) => [item, ...collectItems(item.children ?? [])]);
}

describe('sidebar permission filtering', () => {
  const allItems = NAV_GROUPS.flatMap((group) => group.items);

  it('no publica rutas heredadas que no existen en el router', () => {
    const items = collectItems(allItems);
    const routes = items.map((item) => item.route);

    expect(routes).not.toContain('/reportes');
    expect(routes).not.toContain('/auditoria');
    expect(routes).not.toContain('/logs');
    expect(routes).not.toContain('/notificaciones');
    expect(routes.some((route) => route?.startsWith('/movilidad/'))).toBe(false);
    expect(routes.some((route) => route?.startsWith('/puntos'))).toBe(false);
    expect(routes).not.toContain('/periodos-canje');
    expect(
      items.some((item) =>
        item.permissions?.some((permission) => permission.startsWith('points.')),
      ),
    ).toBe(false);
    expect(routes).toContain('/centro-operacion');
    expect(routes).toContain('/transferencias');
  });

  it('aplica el rol y las capacidades efectivas en organización', () => {
    const items = filterNavigationItems(
      allItems,
      ['branches.view', 'roles.assign'],
      ['branch_manager'],
    );
    const ids = collectIds(items);

    expect(ids).toContain('dashboard');
    expect(ids).toContain('branches');
    expect(ids).toContain('assignments');
    expect(ids).not.toContain('users');
    expect(ids).not.toContain('roles');
  });

  it('no concede menús de otro rol aunque exista una capacidad global', () => {
    const items = filterNavigationItems(allItems, ['all'], ['cashier']);
    const ids = collectIds(items);

    expect(ids).toContain('cashier');
    expect(ids).not.toContain('branches');
    expect(ids).not.toContain('audit');
  });

  it('muestra a gerente general el árbol completo con la capacidad all', () => {
    const filteredItems = filterNavigationItems(allItems, ['all'], ['general_manager']);

    expect(collectIds(filteredItems)).toEqual(
      collectIds(allItems.filter((item) => !item.roles || item.roles.includes('general_manager'))),
    );
  });

  it('dirige al verificador a su bandeja de visitas asignadas', () => {
    const filteredItems = filterNavigationItems(
      allItems,
      ['distributor_applications.view'],
      ['verifier'],
    );
    const item = filteredItems.find((candidate) => candidate.id === 'verifier-visits');

    expect(item?.route).toBe('/verificacion-distribuidoras/verificaciones/asignadas');
    expect(collectIds(filteredItems)).not.toContain('verifications');
  });

  it('muestra verificaciones solo con una capacidad efectiva de M05', () => {
    const sinCapacidad = filterNavigationItems(allItems, [], ['verifier']);
    const conCapacidad = filterNavigationItems(
      allItems,
      ['verification.visits.view'],
      ['verifier'],
    );

    expect(collectIds(sinCapacidad)).not.toContain('verifications');
    expect(collectIds(conCapacidad)).toContain('verifier-visits');
  });
});
