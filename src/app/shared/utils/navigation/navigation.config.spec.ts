import { describe, expect, it } from 'vitest';
import {
  ADMIN_NAV_GROUPS,
  BRANCH_MANAGER_NAV_GROUPS,
  CASHIER_NAV_GROUPS,
  GENERAL_MANAGER_NAV_GROUPS,
  NAV_GROUPS,
  navigationGroupsForRoles,
} from './navigation.config';
import { filterNavigationItems } from '@core/authorization/navigation.permissions';
import type { NavItemData } from './navigation.config';

const leaves = (items: readonly NavItemData[]): NavItemData[] =>
  items.flatMap((item) => (item.children?.length ? leaves(item.children) : [item]));

describe('navigationGroupsForRoles', () => {
  it('organiza la navegación del gerente general en cuatro preguntas operativas', () => {
    const areas = GENERAL_MANAGER_NAV_GROUPS.find(
      (group) => group.heading === 'Gerencia general',
    )?.items;

    expect(areas?.map((item) => item.title)).toEqual([
      'Sucursales',
      'Pendientes',
      'Administración',
      'Auditoría general',
    ]);
    expect(areas?.map((item) => item.description)).toEqual([
      '¿Dónde y con quién quiero trabajar?',
      '¿Qué necesita mi decisión?',
      '¿Con qué productos, categorías y reglas funciona?',
      '¿Qué ocurrió, quién lo hizo y cuándo?',
    ]);
    const navigationLeaves = leaves(areas ?? []);
    const routes = navigationLeaves.map((item) => item.route);

    expect(routes.every(Boolean)).toBe(true);
    expect(new Set(routes).size).toBe(routes.length);
    const generalAudit = areas?.find((item) => item.title === 'Auditoría general');
    expect(generalAudit).toMatchObject({
      route: '/auditoria',
      permissions: ['audit.view_branch', 'audit.view_global', 'audit.view'],
      permissionMode: 'any',
    });
    expect(generalAudit?.children).toBeUndefined();
    const administration = areas?.find((item) => item.title === 'Administración');
    expect(administration?.children?.find((item) => item.id === 'operations-center')).toMatchObject(
      {
        title: 'Centro de operación',
        route: '/centro-operacion',
      },
    );
  });

  it('da al gerente de sucursal la misma metodología gerencial con contexto local', () => {
    const branchAreas = BRANCH_MANAGER_NAV_GROUPS.find(
      (group) => group.heading === 'Gerencia de sucursal',
    )?.items;

    expect(branchAreas?.map((item) => item.title)).toEqual([
      'Mi sucursal',
      'Pendientes',
      'Auditoría general',
    ]);
    expect(branchAreas?.some((item) => item.id === 'general-manager-administration')).toBe(false);
    expect(navigationGroupsForRoles(['branch_manager'])).toBe(BRANCH_MANAGER_NAV_GROUPS);
    expect(leaves(branchAreas ?? []).find((item) => item.id === 'branches')?.title).toBe(
      'Mi sucursal',
    );
    expect(leaves(branchAreas ?? []).some((item) => item.title === 'Sucursales')).toBe(false);
    const branchRoutes = leaves(branchAreas ?? []).map((item) => item.route);
    expect(branchRoutes).not.toContain('/productos');
    expect(branchRoutes).not.toContain('/categorias');
    expect(branchRoutes).not.toContain('/configuraciones');
    expect(branchRoutes).not.toContain('/centro-operacion');
    expect(branchRoutes).toContain('/organizacion/sucursales');
  });

  it('da a Admin la estructura de gerencia general con destinos de solo consulta', () => {
    const permissions = [
      'branches.view',
      'users.view',
      'distributor_applications.view',
      'credit_increase_requests.view_global',
      'vouchers.view_global',
      'manual_reconciliation.view_global',
      'surpluses.view_global',
      'points.view_global',
      'catalogs.view_published',
      'reports.view_global',
      'audit.view_global',
      'logs.view_global',
    ];
    const groups = navigationGroupsForRoles(['admin']);
    const areas = groups.find((group) => group.heading === 'Gerencia general')?.items ?? [];
    const visible = filterNavigationItems(areas, permissions, ['admin']);
    const visibleLeaves = leaves(visible);

    expect(groups).toBe(ADMIN_NAV_GROUPS);
    expect(areas.map((item) => item.title)).toEqual([
      'Sucursales',
      'Pendientes',
      'Administración',
      'Auditoría general',
    ]);
    expect(visibleLeaves.find((item) => item.id === 'admin-applications-review')?.route).toBe(
      '/verificacion-distribuidoras/solicitudes-distribuidora/revision',
    );
    expect(visibleLeaves.find((item) => item.id === 'cashier')?.route).toBe('/vales');
    expect(visibleLeaves.find((item) => item.id === 'general-manager-audit')?.route).toBe(
      '/auditoria',
    );
  });

  it('conserva la navegación vigente para coordinación', () => {
    expect(navigationGroupsForRoles(['coordinator'])).toBe(NAV_GROUPS);
  });

  it('concentra las visitas y su historial en una sola entrada para el verificador', () => {
    expect(
      navigationGroupsForRoles(['verifier'])
        .flatMap((group) => group.items)
        .map((item) => item.title),
    ).toEqual(['Inicio', 'Visitas', 'Calendario']);
  });

  it('usa Inicio y un acordeón operativo para Caja', () => {
    expect(navigationGroupsForRoles(['cashier'])).toBe(CASHIER_NAV_GROUPS);
    expect(CASHIER_NAV_GROUPS.map((group) => group.heading)).toEqual(['Inicio', 'Operación']);
    const cashierGroup = CASHIER_NAV_GROUPS[1]?.items[0];
    expect(cashierGroup?.title).toBe('Caja');
    expect(cashierGroup?.children?.map((item) => item.title)).toEqual([
      'Vales',
      'Pagos',
      'Conciliaciones',
      'Aclaraciones',
    ]);
  });
});
