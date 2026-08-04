import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionStore } from '../../core/session/session.store';
import { AuthFacade } from '../../features/auth/state/auth.facade';

interface MenuItem {
  label: string;
  route: string;
  icon?: string;
  requiredPermissions?: string[];
  requiredRoles?: string[];
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
  private readonly authFacade = inject(AuthFacade);

  // Default to desktop if none provided
  layoutPreference = computed(() => this.sessionStore.layoutPreference() || 'desktop');

  private readonly allMenuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Revisión Solicitudes', route: '/verificacion-distribuidoras/solicitudes-distribuidora/revision', requiredPermissions: ['view_applications'] },
    { label: 'Autorización Solicitudes', route: '/verificacion-distribuidoras/solicitudes-distribuidora/autorizaciones', requiredPermissions: ['authorize_applications'] },
    { label: 'Mis Visitas Asignadas', route: '/verificacion-distribuidoras/verificaciones/asignadas', requiredPermissions: ['verify_applications'] },
    { label: 'Usuarios', route: '/usuarios', requiredPermissions: ['users.view'] },
    { label: 'Roles', route: '/roles', requiredPermissions: ['roles.view'] },
    { label: 'Categorías', route: '/categorias', requiredRoles: ['gerente_general', 'gerente_sucursal', 'admin'] },
    { label: 'Productos', route: '/productos', requiredRoles: ['gerente_general', 'gerente_sucursal', 'admin'] },
    { label: 'Seguridad', route: '/seguridad' },
    { label: 'Perfil', route: '/perfil' },
  ];

  menuItems = computed(() => {
    const userPermissions = this.sessionStore.permissions();
    const userRoles = this.sessionStore.roles();
    
    return this.allMenuItems.filter(item => {
      const hasPermission = !item.requiredPermissions || item.requiredPermissions.length === 0 || 
                            userPermissions.includes('all') ||
                            item.requiredPermissions.some(perm => userPermissions.includes(perm));
      const hasRole = !item.requiredRoles || item.requiredRoles.length === 0 || 
                      (userRoles && userRoles.some(role => role === 'admin' || item.requiredRoles!.includes(role)));
                      
      return hasPermission && hasRole;
    });
  });

  logout() {
    this.authFacade.logout();
  }
}
