import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { NavItemData } from '@shared/utils/navigation/navigation.config';
import { findNavigationTitle } from './shell-header.component';

describe('findNavigationTitle', () => {
  const items: readonly NavItemData[] = [
    { id: 'home', title: 'Inicio', icon: 'home', route: '/inicio' },
    {
      id: 'organization',
      title: 'Organización',
      icon: 'building',
      children: [
        { id: 'branches', title: 'Sucursales', icon: 'map-pin', route: '/organizacion/sucursales' },
        {
          id: 'branch-detail',
          title: 'Detalle de sucursal',
          icon: 'map-pin',
          route: '/organizacion/sucursales/detalle',
        },
      ],
    },
  ];

  it('uses the most specific configured navigation label for detail URLs', () => {
    expect(findNavigationTitle(items, '/organizacion/sucursales/detalle/123')).toBe(
      'Detalle de sucursal',
    );
  });

  it('fails closed to the product name for an unknown URL', () => {
    expect(findNavigationTitle(items, '/ruta-no-configurada')).toBe('MisVales');
  });
});
