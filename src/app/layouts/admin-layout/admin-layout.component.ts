import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionStore } from '../../core/session/session.store';

interface MenuItem {
  label: string;
  route: string;
  icon?: string;
  requiredPermissions?: string[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
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

  // Default to desktop if none provided
  layoutPreference = computed(() => this.sessionStore.layoutPreference() || 'desktop');

  private readonly allMenuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Usuarios', route: '/usuarios', requiredPermissions: ['users.view'] },
    { label: 'Roles', route: '/roles', requiredPermissions: ['roles.view'] },
    { label: 'Seguridad', route: '/seguridad' },
    { label: 'Perfil', route: '/perfil' },
  ];

  menuItems = computed(() => {
    const userPermissions = this.sessionStore.permissions();
    return this.allMenuItems.filter(item => {
      if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
        return true;
      }
      return item.requiredPermissions.some(perm => userPermissions.includes(perm));
    });
  });

  logout() {
    this.sessionStore.clearSession();
  }
}
