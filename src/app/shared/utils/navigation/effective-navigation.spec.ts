import { describe, expect, it } from 'vitest';
import type { NavGroupData, NavItemData } from './navigation.config';
import { effectiveNavigationItems } from './effective-navigation';

const groups: NavGroupData[] = [
  {
    heading: 'Operación',
    icon: 'layout-dashboard',
    items: [
      {
        id: 'visible',
        title: 'Visible',
        icon: 'eye',
        route: '/visible',
        roles: ['admin'],
        permissions: ['records.view'],
      },
      {
        id: 'restricted',
        title: 'Restringida',
        icon: 'settings',
        route: '/restricted',
        roles: ['admin'],
        permissions: ['records.manage'],
      },
    ],
  },
];

const account: NavItemData[] = [
  { id: 'logout', title: 'Cerrar sesión', icon: 'log-out', action: 'logout', roles: ['admin'] },
];

describe('effectiveNavigationItems', () => {
  it('solo devuelve rutas y acciones permitidas para la sesión', () => {
    const items = effectiveNavigationItems(groups, account, ['records.view'], ['admin']);

    expect(items.map((item) => item.id)).toEqual(['visible', 'logout']);
    expect(items[0].group).toBe('Operación');
  });
});
