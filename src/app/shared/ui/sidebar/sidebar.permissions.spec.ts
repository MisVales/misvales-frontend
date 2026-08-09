import { describe, expect, it } from 'vitest';
import { NAV_GROUPS, type NavItemData } from './sidebar.config';
import { filterNavigationItems } from './sidebar.permissions';

function collectIds(items: readonly NavItemData[]): string[] {
  return items.flatMap((item) => [item.id, ...collectIds(item.children ?? [])]);
}

describe('sidebar permission filtering', () => {
  const allItems = NAV_GROUPS.flatMap((group) => group.items);

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

    expect(collectIds(filteredItems)).toEqual(collectIds(allItems));
  });

  it('muestra verificaciones solo con una capacidad efectiva de M05', () => {
    const sinCapacidad = filterNavigationItems(allItems, [], ['verifier']);
    const conCapacidad = filterNavigationItems(
      allItems,
      ['verification.visits.view'],
      ['verifier'],
    );

    expect(collectIds(sinCapacidad)).not.toContain('verifications');
    expect(collectIds(conCapacidad)).toContain('verifications');
  });
});
