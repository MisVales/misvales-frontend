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
  private routerSub!: Subscription;

  /** ID de la categoría principal (nivel 0) abierta */
  openGroupId = signal<string | null>(null);

  /** Map de parent-id → child-id abierto (para subcategorías) */
  openSubgroupByParent = signal<Record<string, string>>({});

  /** Ruta activa actual */
  activeRoute = signal<string>('');

  /** Sidebar colapsado (rail) */
  isCollapsed = signal(false);

  // ─── Navegación filtrada por permisos ──────────────────────

  filteredNavGroups = computed<NavGroupData[]>(() => {
    return NAV_GROUPS;
  });

  filteredBottomItems = computed<NavItemData[]>(() => {
    return BOTTOM_ITEMS;
  });

  userName = computed(() => this.sessionStore.user()?.name ?? '');
  userEmail = computed(() => this.sessionStore.user()?.email ?? '');

  // ─── Lifecycle ─────────────────────────────────────────────

  ngOnInit(): void {
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
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
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
    if (item.action === 'search') {
      // TODO: abrir command palette / modal de búsqueda
      return;
    }
    if (item.action === 'logout') {
      this.authFacade.logout();
      return;
    }
  }

  toggleCollapse(): void {
    this.isCollapsed.update((v) => !v);
  }

  // ─── Helpers privados ──────────────────────────────────────

  /** Filtra items recursivamente por permisos, oculta categorías vacías */
  private filterItems(items: NavItemData[], perms: string[]): NavItemData[] {
    return items
      .map((item) => {
        // Si tiene permiso requerido y el usuario no lo tiene, ocultar
        if (item.permission && !perms.includes(item.permission)) {
          // Excepción: items sin permiso declarado siempre se muestran (Buscar, Mi cuenta, etc.)
          return null;
        }

        // Filtrar hijos recursivamente
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterItems(item.children, perms);
          // Si no quedan hijos visibles y no tiene ruta propia, ocultar la categoría
          if (filteredChildren.length === 0 && !item.route && !item.action) {
            return null;
          }
          return { ...item, children: filteredChildren };
        }

        return item;
      })
      .filter((item): item is NavItemData => item !== null);
  }

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
