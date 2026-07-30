import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SessionStore } from '@core/session/session.store';
import { authorizedNavigation, NAVIGATION_ITEMS } from '@layouts/navigation/navigation.config';

@Component({
  selector: 'mv-tablet-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './tablet-layout.component.html',
  styleUrl: './tablet-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabletLayoutComponent {
  private readonly session = inject(SessionStore);
  readonly navigation = computed(() =>
    authorizedNavigation(NAVIGATION_ITEMS, this.session, 'tableta'),
  );
}
