import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SessionStore } from '@core/session/session.store';
import { authorizedNavigation, NAVIGATION_ITEMS } from '@layouts/navigation/navigation.config';
import { LogoutButtonComponent } from '@shared/components/logout-button.component';

@Component({
  selector: 'mv-mobile-layout',
  imports: [LogoutButtonComponent, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './mobile-layout.component.html',
  styleUrl: './mobile-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileLayoutComponent {
  private readonly session = inject(SessionStore);
  readonly homePath = inject(Router).url.startsWith('/movil') ? '/movil' : '/distribuidora';
  readonly navigation = computed(() =>
    authorizedNavigation(NAVIGATION_ITEMS, this.session, 'distribuidora'),
  );
}
