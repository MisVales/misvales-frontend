import type { NavItemData, RoleCode } from './sidebar.config';

export function hasEffectivePermission(
  permissions: readonly string[],
  requiredPermissions: readonly string[],
  mode: 'all' | 'any' = 'all',
): boolean {
  if (permissions.includes('all')) return true;
  return mode === 'any'
    ? requiredPermissions.some((permission) => permissions.includes(permission))
    : requiredPermissions.every((permission) => permissions.includes(permission));
}

export function filterNavigationItems(
  items: readonly NavItemData[],
  permissions: readonly string[],
  roles: readonly string[],
): NavItemData[] {
  return items
    .map((item): NavItemData | null => {
      if (item.roles && !item.roles.some((role: RoleCode) => roles.includes(role))) {
        return null;
      }

      if (
        item.permissions &&
        !hasEffectivePermission(permissions, item.permissions, item.permissionMode)
      ) {
        return null;
      }

      if (!item.children?.length) return { ...item };

      const children = filterNavigationItems(item.children, permissions, roles);
      if (children.length === 0 && !item.route && !item.action) return null;

      return { ...item, children };
    })
    .filter((item): item is NavItemData => item !== null);
}
