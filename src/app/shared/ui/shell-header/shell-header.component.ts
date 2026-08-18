import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { SessionStore } from '@core/session/session.store';
import { ShellNavigationService } from '@core/services/shell-navigation.service';
import { AuthFacade } from '@features/auth/state/auth.facade';
import { BOTTOM_ITEMS, NAV_GROUPS, NavItemData } from '../sidebar/sidebar.config';
import { filterNavigationItems } from '../sidebar/sidebar.permissions';
import { BreadcrumbsComponent, BreadcrumbItem } from '../breadcrumbs/breadcrumbs.component';

const OPERATIONS_PERMISSIONS = [
  'notifications.view_own',
  'reports.view_branch',
  'reports.view_global',
  'audit.view_branch',
  'audit.view_global',
  'logs.view_branch',
  'logs.view_global',
];

@Component({
  selector: 'app-shell-header',
  standalone: true,
  imports: [BreadcrumbsComponent, LucideAngularModule, RouterLink],
  template: `
    <header class="shell-header">
      <button
        type="button"
        class="shell-header__menu"
        (click)="shellNavigation.toggleMobileMenu()"
        [attr.aria-expanded]="shellNavigation.mobileMenuOpen()"
        aria-controls="primary-navigation"
        aria-label="Abrir navegación principal"
      >
        <lucide-icon name="menu"></lucide-icon>
      </button>

      <div class="shell-header__context">
        <app-breadcrumbs [items]="breadcrumbs()"></app-breadcrumbs>
        <span class="shell-header__section">{{ currentTitle() }}</span>
      </div>

      <nav class="shell-header__actions" aria-label="Acciones de sesión">
        @if (canOpenOperationsCenter()) {
          <a routerLink="/centro-operacion" aria-label="Abrir notificaciones y centro de operación" title="Centro de operación">
            <lucide-icon name="bell"></lucide-icon>
          </a>
        }
        <a class="shell-header__user" routerLink="/seguridad" aria-label="Abrir perfil y seguridad">
          <span aria-hidden="true">{{ initials() }}</span>
          <strong>{{ userName() }}</strong>
        </a>
        <button type="button" class="shell-header__logout" (click)="logout()">Cerrar sesión</button>
      </nav>
    </header>
  `,
  styles: `
    :host { display: block; position: sticky; z-index: 20; top: 0; }
    .shell-header {
      display: flex;
      min-height: 4.25rem;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid var(--mv-border);
      background: color-mix(in srgb, var(--mv-surface) 94%, transparent);
      padding: .65rem clamp(1rem, 2.2vw, 2rem);
      backdrop-filter: blur(12px);
    }
    .shell-header__menu { display: none; }
    .shell-header__context { min-width: 0; flex: 1; }
    .shell-header__context app-breadcrumbs { display: block; height: 1.15rem; }
    .shell-header__section { display: block; overflow: hidden; color: var(--mv-text); font-size: .875rem; font-weight: 720; text-overflow: ellipsis; white-space: nowrap; }
    .shell-header__actions { display: flex; align-items: center; gap: .5rem; }
    .shell-header__actions > a,
    .shell-header__actions > button {
      display: inline-flex;
      min-height: 2.5rem;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--mv-border);
      border-radius: var(--mv-radius-sm);
      background: var(--mv-surface);
      color: var(--mv-text);
      text-decoration: none;
    }
    .shell-header__actions > a:not(.shell-header__user) { width: 2.5rem; }
    .shell-header__actions lucide-icon { width: 1.1rem; height: 1.1rem; }
    .shell-header__user { gap: .55rem; padding: .25rem .65rem .25rem .3rem; }
    .shell-header__user > span { display: grid; width: 1.9rem; height: 1.9rem; place-items: center; border-radius: 50%; background: var(--mv-primary-100); color: var(--mv-primary-700); font-size: .7rem; font-weight: 800; }
    .shell-header__user strong { max-width: 10rem; overflow: hidden; font-size: .78rem; text-overflow: ellipsis; white-space: nowrap; }
    .shell-header__logout { padding: .5rem .75rem; font-size: .75rem; font-weight: 700; cursor: pointer; }
    .shell-header__actions > a:hover,
    .shell-header__actions > button:hover { border-color: var(--mv-border-strong); background: var(--mv-surface-muted); }
    @media (max-width: 767px) {
      .shell-header { min-height: 3.75rem; padding: .5rem .75rem; }
      .shell-header__menu { display: inline-grid; width: 2.625rem; height: 2.625rem; flex: 0 0 auto; place-items: center; border: 1px solid var(--mv-border); border-radius: var(--mv-radius-sm); background: var(--mv-surface); color: var(--mv-text); }
      .shell-header__context app-breadcrumbs { display: none; }
      .shell-header__user strong, .shell-header__logout { display: none; }
      .shell-header__user { padding: .25rem; border: 0 !important; background: transparent !important; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellHeaderComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionStore = inject(SessionStore);
  private readonly authFacade = inject(AuthFacade);
  readonly shellNavigation = inject(ShellNavigationService);
  private readonly currentUrl = signal(this.router.url);

  readonly userName = computed(() => this.sessionStore.user()?.name ?? 'Mi cuenta');
  readonly initials = computed(() => this.userName().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase());
  readonly visibleItems = computed(() => [
    ...NAV_GROUPS.flatMap((group) =>
      filterNavigationItems(group.items, this.sessionStore.permissions(), this.sessionStore.roles()),
    ),
    ...filterNavigationItems(BOTTOM_ITEMS, this.sessionStore.permissions(), this.sessionStore.roles()),
  ]);
  readonly currentTitle = computed(() => findNavigationTitle(this.visibleItems(), this.currentUrl()));
  readonly breadcrumbs = computed<readonly BreadcrumbItem[]>(() => [
    { label: 'Inicio', url: '/inicio' },
    ...(this.currentUrl().startsWith('/inicio') ? [] : [{ label: this.currentTitle() }]),
  ]);
  readonly canOpenOperationsCenter = computed(() => {
    const permissions = new Set(this.sessionStore.permissions());
    return OPERATIONS_PERMISSIONS.some((permission) => permissions.has(permission));
  });

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.currentUrl.set((event as NavigationEnd).urlAfterRedirects));
  }

  logout(): void {
    this.authFacade.logout();
  }
}

export function findNavigationTitle(items: readonly NavItemData[], url: string): string {
  const matches: NavItemData[] = [];
  const visit = (candidates: readonly NavItemData[]): void => {
    for (const item of candidates) {
      if (item.route && (url === item.route || url.startsWith(`${item.route}/`))) matches.push(item);
      if (item.children) visit(item.children);
    }
  };
  visit(items);
  matches.sort((left, right) => (right.route?.length ?? 0) - (left.route?.length ?? 0));
  return matches[0]?.title ?? 'MisVales';
}
