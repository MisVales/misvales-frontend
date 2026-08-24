import type { NavGroupData, NavItemData } from './navigation.config';
import { filterNavigationItems } from '@core/authorization/navigation.permissions';

export interface EffectiveNavigationItem extends NavItemData {
  group: string;
}

export interface EffectiveNavigationGroup {
  label: string;
  items: EffectiveNavigationItem[];
}

export function flattenNavigationItems(
  items: readonly NavItemData[],
  group: string,
): EffectiveNavigationItem[] {
  return items.flatMap((item) => {
    const current = item.route || item.action ? [{ ...item, group, children: undefined }] : [];
    return [...current, ...flattenNavigationItems(item.children ?? [], group)];
  });
}

export function effectiveNavigationItems(
  groups: readonly NavGroupData[],
  bottomItems: readonly NavItemData[],
  permissions: readonly string[],
  roles: readonly string[],
): EffectiveNavigationItem[] {
  const visible = groups.flatMap((group) =>
    flattenNavigationItems(
      filterNavigationItems(group.items, permissions, roles),
      group.heading,
    ),
  );
  const account = flattenNavigationItems(
    filterNavigationItems(bottomItems, permissions, roles),
    'Cuenta',
  );

  const seen = new Set<string>();
  return [...visible, ...account].filter((item) => {
    const key = item.route
      ? `route:${item.route}#${item.fragment ?? ''}`
      : `action:${item.action}:${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function groupEffectiveNavigation(
  items: readonly EffectiveNavigationItem[],
): EffectiveNavigationGroup[] {
  const groups = new Map<string, EffectiveNavigationItem[]>();
  for (const item of items) groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
  return Array.from(groups, ([label, groupedItems]) => ({ label, items: groupedItems }));
}
