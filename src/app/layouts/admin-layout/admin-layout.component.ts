import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionStore } from '../../core/session/session.store';
import { AuthFacade } from '../../features/auth/state/auth.facade';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { MfaModal } from '../../shared/ui/mfa-modal/mfa-modal';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, MfaModal],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.layout-desktop]': 'layoutPreference() === "desktop"',
    '[class.layout-tablet]': 'layoutPreference() === "tablet"',
    '[class.layout-mobile]': 'layoutPreference() === "mobile"',
  }
})
export class AdminLayoutComponent {
  private readonly sessionStore = inject(SessionStore);
  private readonly authFacade = inject(AuthFacade);

  // Default to desktop if none provided
  layoutPreference = computed(() => this.sessionStore.layoutPreference() || 'desktop');


  logout() {
    this.authFacade.logout();
  }
}

