import { SessionStore } from '@core/session/session.store';

import { authorizedNavigation, NavigationItem } from './navigation.config';

describe('authorizedNavigation', () => {
  it('shows an item when one of its documented capabilities is present', () => {
    const session = new SessionStore();
    session.establish({
      experience: 'administrativa',
      permissions: new Set(['risk.view.global']),
    });
    const items: readonly NavigationItem[] = [
      {
        label: 'Riesgo',
        path: '/administrativa/riesgo',
        experience: 'administrativa',
        anyPermissions: ['risk.view.branch', 'risk.view.global'],
      },
    ];

    expect(authorizedNavigation(items, session, 'administrativa')).toEqual(items);
  });

  it('denies items without an explicit matching capability', () => {
    const session = new SessionStore();
    session.establish({ experience: 'tableta', permissions: new Set() });
    const items: readonly NavigationItem[] = [
      {
        label: 'Riesgo',
        path: '/operativa/riesgo',
        experience: 'tableta',
        anyPermissions: ['risk.view.assigned'],
      },
    ];

    expect(authorizedNavigation(items, session, 'tableta')).toEqual([]);
  });
});
