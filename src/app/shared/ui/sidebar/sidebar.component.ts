import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { SessionStore } from '../../../core/session/session.store';
import { NAV_GROUPS, BOTTOM_ITEMS, NavItemData, NavGroupData } from './sidebar.config';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription, filter } from 'rxjs';
import { AuthFacade } from '../../../features/auth/state/auth.facade';
import { filterNavigationItems } from './sidebar.permissions';
import { ShellNavigationService } from '../../../core/services/shell-navigation.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    NgTemplateOutlet,
    LucideAngularModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly sessionStore = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);
  readonly shellNavigation = inject(ShellNavigationService);
  private routerSub!: Subscription;
  private mobileMedia?: MediaQueryList;

  /** ID de la categoría principal (nivel 0) abierta */
  openGroupId = signal<string | null>(null);

  /** Map de parent-id → child-id abierto (para subcategorías) */
  openSubgroupByParent = signal<Record<string, string>>({});

  /** Ruta activa actual */
  activeRoute = signal<string>('');

  /** Sidebar colapsado (rail) */
  isCollapsed = signal(false);
  isSmallScreen = signal(false);

  // ─── Navegación filtrada por permisos ──────────────────────

  filteredNavGroups = computed<NavGroupData[]>(() => {
    const permissions = this.sessionStore.permissions();
    const roles = this.sessionStore.roles();

    return NAV_GROUPS
      .map((group) => ({
        ...group,
        items: filterNavigationItems(group.items, permissions, roles),
      }))
      .filter((group) => group.items.length > 0);
  });

  filteredBottomItems = computed<NavItemData[]>(() => {
    return filterNavigationItems(
      BOTTOM_ITEMS,
      this.sessionStore.permissions(),
      this.sessionStore.roles(),
    );
  });

  userName = computed(() => this.sessionStore.user()?.name ?? '');
  userEmail = computed(() => this.sessionStore.user()?.email ?? '');

  // ─── Lifecycle ─────────────────────────────────────────────

  ngOnInit(): void {
    this.mobileMedia = window.matchMedia('(max-width: 767px)');
    this.isSmallScreen.set(this.mobileMedia.matches);
    this.mobileMedia.addEventListener('change', this.onMobileMediaChange);
    // Set initial route
    this.activeRoute.set(this.router.url);
    this.openAncestorsForRoute(this.router.url);

    // Sync with router
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = (e as NavigationEnd).urlAfterRedirects;
        this.activeRoute.set(url);
        this.openAncestorsForRoute(url);
        this.shellNavigation.closeMobileMenu();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.mobileMedia?.removeEventListener('change', this.onMobileMediaChange);
  }

  // ─── Acordeón controlado ───────────────────────────────────

  toggleGroup(item: NavItemData, parentId?: string): void {
    if (!parentId) {
      // Nivel 0: solo 1 abierto
      this.openGroupId.update((current) =>
        current === item.id ? null : item.id,
      );
    } else {
      // Subcategoría: solo 1 hermana abierta por padre
      this.openSubgroupByParent.update((map) => {
        const newMap = { ...map };
        if (newMap[parentId] === item.id) {
          delete newMap[parentId];
        } else {
          newMap[parentId] = item.id;
        }
        return newMap;
      });
    }
  }

  isGroupOpen(itemId: string, parentId?: string): boolean {
    if (!parentId) {
      return this.openGroupId() === itemId;
    }
    return this.openSubgroupByParent()[parentId] === itemId;
  }

  /** Verifica si un item o algún descendiente tiene la ruta activa */
  hasActiveDescendant(item: NavItemData): boolean {
    const url = this.activeRoute();
    if (item.route && url.startsWith(item.route)) return true;
    if (item.children) {
      return item.children.some((child) => this.hasActiveDescendant(child));
    }
    return false;
  }

  isActive(item: NavItemData): boolean {
    if (!item.route) return false;
    const url = this.activeRoute();
    // Exact for top-level, startsWith for nested
    return url === item.route || url.startsWith(item.route + '/');
  }

  // ─── Acciones ──────────────────────────────────────────────

  onItemClick(item: NavItemData): void {
    this.shellNavigation.closeMobileMenu();
    if (item.action === 'logout') {
      this.authFacade.logout();
      return;
    }
  }

  toggleCollapse(): void {
    this.isCollapsed.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.shellNavigation.closeMobileMenu();
  }

  private readonly onMobileMediaChange = (event: MediaQueryListEvent): void => {
    this.isSmallScreen.set(event.matches);
    if (!event.matches) this.shellNavigation.closeMobileMenu();
  };

  // ─── Helpers privados ──────────────────────────────────────

  /** Abre automáticamente los ancestros de la ruta activa */
  private openAncestorsForRoute(url: string): void {
    // Buscar en navGroups
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (this.itemContainsRoute(item, url)) {
          this.openGroupId.set(item.id);

          // Buscar subcategoría
          if (item.children) {
            for (const child of item.children) {
              if (this.itemContainsRoute(child, url)) {
                this.openSubgroupByParent.update((m) => ({
                  ...m,
                  [item.id]: child.id,
                }));
                break;
              }
            }
          }
          return;
        }
      }
    }

    // Buscar en bottom items
    for (const item of BOTTOM_ITEMS) {
      if (this.itemContainsRoute(item, url)) {
        this.openGroupId.set(item.id);
        return;
      }
    }
  }

  /** Verifica si un item o descendiente contiene la ruta */
  private itemContainsRoute(item: NavItemData, url: string): boolean {
    if (item.route && (url === item.route || url.startsWith(item.route + '/'))) {
      return true;
    }
    if (item.children) {
      return item.children.some((c) => this.itemContainsRoute(c, url));
    }
    return false;
  }
}
