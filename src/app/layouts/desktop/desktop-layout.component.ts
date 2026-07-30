import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SessionStore } from '@core/session/session.store';
import { authorizedNavigation, NAVIGATION_ITEMS } from '@layouts/navigation/navigation.config';

@Component({
  selector: 'mv-desktop-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './desktop-layout.component.html',
  styleUrl: './desktop-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesktopLayoutComponent {
  private readonly session = inject(SessionStore);
  readonly collapsed = signal(false);
  readonly navigation = computed(() =>
    authorizedNavigation(NAVIGATION_ITEMS, this.session, 'administrativa'),
  );
}
