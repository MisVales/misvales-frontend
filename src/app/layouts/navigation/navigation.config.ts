import { ApplicationExperience, SessionStore } from '@core/session/session.store';

export interface NavigationItem {
  readonly label: string;
  readonly path: string;
  readonly experience: ApplicationExperience;
  readonly permission: string;
}

// Business entries are added by later stages only after their routes and permissions
// exist in the backend contract.
export const NAVIGATION_ITEMS: readonly NavigationItem[] = [];

export function authorizedNavigation(
  items: readonly NavigationItem[],
  session: SessionStore,
  experience: ApplicationExperience,
): readonly NavigationItem[] {
  return items.filter(
    (item) => item.experience === experience && session.hasPermission(item.permission),
  );
}
