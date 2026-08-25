import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { SessionStore } from '@core/session/session.store';
import { ShellNavigationService } from '../navigation/shell-navigation.service';
import { AuthFacade } from '@core/auth/state/auth.facade';
import { BOTTOM_ITEMS, NAV_GROUPS, NavItemData } from '@shared/utils/navigation/navigation.config';
import { filterNavigationItems } from '@core/authorization/navigation.permissions';
import {
  BreadcrumbsComponent,
  BreadcrumbItem,
} from '@shared/components/navigation/breadcrumbs/breadcrumbs.component';
import {
  UserAvatarComponent,
  UserMenuComponent,
} from '@features/verifications/presentation/components/primitives/verification-primitives';
import { MenuItem } from '@features/verifications/presentation/models/verification.models';
import { CentroOperacionApiService } from '@features/notifications/centro-operacion-api.service';

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
  imports: [
    BreadcrumbsComponent,
    LucideAngularModule,
    RouterLink,
    UserAvatarComponent,
    UserMenuComponent,
  ],
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
        <time class="shell-header__clock" [attr.datetime]="currentDateTime().toISOString()">
          <span>{{ formattedDate() }}</span>
          <strong>{{ formattedTime() }}</strong>
        </time>
        @if (canOpenOperationsCenter()) {
          <a
            class="shell-header__notification"
            routerLink="/centro-operacion"
            [attr.aria-label]="notificationAriaLabel()"
            title="Centro de operación"
          >
            <lucide-icon name="bell" [size]="18" aria-hidden="true"></lucide-icon>
            @if (unreadCount() > 0) {
              <span class="shell-header__notification-badge" aria-hidden="true">
                {{ displayedUnreadCount() }}
              </span>
            }
          </a>
        }
        <div class="shell-header__account">
          <button
            type="button"
            class="shell-header__user"
            (click)="toggleAccountMenu()"
            [attr.aria-expanded]="accountMenuOpen()"
            aria-haspopup="menu"
            aria-controls="account-menu"
          >
            <verification-user-avatar
              class="shell-header__avatar"
              [initials]="initials()"
              [name]="userName()"
            />
            <span class="shell-header__identity">
              <strong>{{ userName() }}</strong>
              <small>{{ roleName() }}</small>
            </span>
            <lucide-icon
              name="chevron-down"
              class="shell-header__account-chevron"
              [class.shell-header__account-chevron--open]="accountMenuOpen()"
              aria-hidden="true"
            ></lucide-icon>
          </button>

          @if (accountMenuOpen()) {
            <div id="account-menu" class="shell-header__account-menu" role="menu">
              <div class="shell-header__account-summary">
                <verification-user-avatar [initials]="initials()" [name]="userName()" />
                <div>
                  <strong>{{ userName() }}</strong>
                  <small>{{ roleName() }}</small>
                </div>
              </div>
              <verification-user-menu
                [items]="accountMenuItems"
                [readOnly]="false"
                (itemSelected)="handleAccountAction($event)"
              />
            </div>
          }
        </div>
      </nav>
    </header>
  `,
  styles: `
    :host {
      display: block;
      position: sticky;
      z-index: 20;
      top: 0;
    }
    .shell-header {
      display: flex;
      min-height: 4.25rem;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid var(--mv-border);
      background: color-mix(in srgb, var(--mv-surface) 94%, transparent);
      padding: 0.65rem clamp(1rem, 2.2vw, 2rem);
      backdrop-filter: blur(12px);
    }
    .shell-header__menu {
      display: none;
    }
    .shell-header__context {
      min-width: 0;
      flex: 1;
    }
    .shell-header__context app-breadcrumbs {
      display: block;
      height: 1.15rem;
    }
    .shell-header__section {
      display: block;
      overflow: hidden;
      color: var(--mv-text);
      font-size: 0.875rem;
      font-weight: 720;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .shell-header__actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .shell-header__clock {
      display: grid;
      min-width: 8.5rem;
      justify-items: end;
      padding-inline: 0.4rem;
      color: var(--mv-text-muted);
      font-size: 0.68rem;
      line-height: 1.2;
      text-decoration: none;
      text-transform: capitalize;
      white-space: nowrap;
    }
    .shell-header__clock strong {
      margin-top: 0.18rem;
      color: var(--mv-text);
      font-size: 0.78rem;
      font-variant-numeric: tabular-nums;
    }
    .shell-header__actions > a,
    .shell-header__actions > button,
    .shell-header__user {
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
    .shell-header__actions > a:not(.shell-header__user) {
      width: 2.5rem;
    }
    .shell-header__notification {
      display: grid !important;
      position: relative;
      flex: 0 0 2.5rem;
      place-items: center;
      padding: 0;
      line-height: 0;
      overflow: visible;
    }
    .shell-header__notification lucide-icon {
      transform: translateY(-0.0625rem);
    }
    .shell-header__notification-badge {
      position: absolute;
      z-index: 1;
      top: -0.4rem;
      right: -0.45rem;
      display: inline-grid;
      min-width: 1.15rem;
      height: 1.15rem;
      box-sizing: border-box;
      place-items: center;
      border: 2px solid var(--mv-surface);
      border-radius: 999px;
      background: var(--mv-danger-700, #b42318);
      padding-inline: 0.2rem;
      color: #fff;
      font-size: 0.6rem;
      font-weight: 800;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      box-shadow: 0 1px 2px rgb(15 23 42 / 22%);
      pointer-events: none;
    }
    .shell-header__actions lucide-icon {
      display: grid;
      width: 1.125rem;
      height: 1.125rem;
      place-items: center;
    }
    .shell-header__account {
      position: relative;
    }
    .shell-header__user {
      min-height: 3rem;
      gap: 0.65rem;
      border-color: transparent;
      padding: 0.2rem 0.45rem 0.2rem 0.25rem;
      cursor: pointer;
    }
    .shell-header__avatar,
    .shell-header__account-summary verification-user-avatar {
      display: inline-flex;
      flex: 0 0 auto;
    }
    .shell-header__identity {
      display: grid;
      min-width: 0;
      text-align: left;
    }
    .shell-header__identity strong,
    .shell-header__identity small,
    .shell-header__account-summary strong,
    .shell-header__account-summary small {
      display: block;
      max-width: 11rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .shell-header__identity strong,
    .shell-header__account-summary strong {
      color: var(--mv-text);
      font-size: 0.78rem;
      line-height: 1.2;
    }
    .shell-header__identity small,
    .shell-header__account-summary small {
      margin-top: 0.15rem;
      color: var(--mv-text-muted);
      font-size: 0.66rem;
      line-height: 1.2;
    }
    .shell-header__account-chevron {
      width: 0.9rem !important;
      height: 0.9rem !important;
      color: var(--mv-text-muted);
      transition: transform var(--mv-motion-fast, 150ms) var(--mv-ease);
    }
    .shell-header__account-chevron--open {
      transform: rotate(180deg);
    }
    .shell-header__account-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      display: grid;
      width: min(18rem, calc(100vw - 2rem));
      overflow: hidden;
      border: 1px solid var(--mv-border);
      border-radius: var(--mv-radius-md, 0.75rem);
      background: var(--mv-surface);
      box-shadow: 0 1rem 2.5rem rgb(15 45 29 / 14%);
    }
    .shell-header__account-menu verification-user-menu {
      display: block;
    }
    .shell-header__account-summary {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid var(--mv-border);
      padding: 0.85rem;
    }
    .shell-header__account-summary > div {
      min-width: 0;
    }
    .shell-header__user:focus-visible {
      outline: 2px solid var(--mv-primary-600);
      outline-offset: -2px;
    }
    .shell-header__actions > a:hover,
    .shell-header__actions > button:hover {
      border-color: var(--mv-border-strong);
      background: var(--mv-surface-muted);
    }
    @media (max-width: 1024px) {
      .shell-header__clock {
        min-width: auto;
      }
      .shell-header__clock > span {
        display: none;
      }
      .shell-header__clock strong {
        margin-top: 0;
      }
    }
    @media (max-width: 767px) {
      .shell-header {
        min-height: 3.75rem;
        padding: 0.5rem 0.75rem;
      }
      .shell-header__menu {
        display: inline-grid;
        width: 2.625rem;
        height: 2.625rem;
        flex: 0 0 auto;
        place-items: center;
        border: 1px solid var(--mv-border);
        border-radius: var(--mv-radius-sm);
        background: var(--mv-surface);
        color: var(--mv-text);
      }
      .shell-header__context app-breadcrumbs {
        display: none;
      }
      .shell-header__user strong,
      .shell-header__identity,
      .shell-header__account-chevron {
        display: none;
      }
      .shell-header__user {
        padding: 0.25rem;
        border: 0 !important;
        background: transparent !important;
      }
      .shell-header__clock {
        padding-inline: 0.1rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellHeaderComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly sessionStore = inject(SessionStore);
  private readonly authFacade = inject(AuthFacade);
  private readonly notificationsApi = inject(CentroOperacionApiService);
  readonly shellNavigation = inject(ShellNavigationService);
  private readonly currentUrl = signal(this.router.url);
  readonly accountMenuOpen = signal(false);
  readonly unreadCount = signal(0);
  readonly displayedUnreadCount = computed(() =>
    this.unreadCount() > 99 ? '99+' : String(this.unreadCount()),
  );
  readonly notificationAriaLabel = computed(() => {
    const count = this.unreadCount();
    return count > 0
      ? `Abrir notificaciones y centro de operación, ${count} ${count === 1 ? 'notificación no leída' : 'notificaciones no leídas'}`
      : 'Abrir notificaciones y centro de operación';
  });
  readonly accountMenuItems: readonly MenuItem[] = [
    { id: 'account', label: 'Mi cuenta', icon: 'circle-user-round' },
    { id: 'logout', label: 'Cerrar sesión', icon: 'log-out' },
  ];
  readonly currentDateTime = signal(new Date());
  readonly formattedDate = computed(() =>
    new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(this.currentDateTime()),
  );
  readonly formattedTime = computed(() =>
    new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(this.currentDateTime()),
  );

  readonly userName = computed(() => this.sessionStore.user()?.name ?? 'Mi cuenta');
  readonly initials = computed(() =>
    this.userName()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
  );
  readonly roleName = computed(() => {
    const scopes = this.sessionStore.scopes();
    const activeBranch = this.sessionStore.activeBranch();
    return (
      scopes.find((scope) => scope.branchId === activeBranch)?.roleName ??
      scopes[0]?.roleName ??
      'Usuario'
    );
  });
  readonly visibleItems = computed(() => [
    ...NAV_GROUPS.flatMap((group) =>
      filterNavigationItems(
        group.items,
        this.sessionStore.permissions(),
        this.sessionStore.roles(),
      ),
    ),
    ...filterNavigationItems(
      BOTTOM_ITEMS,
      this.sessionStore.permissions(),
      this.sessionStore.roles(),
    ),
  ]);
  readonly currentTitle = computed(() =>
    findNavigationTitle(this.visibleItems(), this.currentUrl()),
  );
  readonly breadcrumbs = computed<readonly BreadcrumbItem[]>(() => [
    { label: 'Inicio', url: '/inicio' },
    ...(this.currentUrl().startsWith('/inicio') ? [] : [{ label: this.currentTitle() }]),
  ]);
  readonly canOpenOperationsCenter = computed(() => {
    const permissions = new Set(this.sessionStore.permissions());
    return OPERATIONS_PERMISSIONS.some((permission) => permissions.has(permission));
  });

  constructor() {
    const clockInterval = window.setInterval(() => this.currentDateTime.set(new Date()), 1000);
    this.destroyRef.onDestroy(() => window.clearInterval(clockInterval));

    if (this.sessionStore.permissions().includes('notifications.view_own')) {
      this.refreshUnreadCount();
    }

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.currentUrl.set((event as NavigationEnd).urlAfterRedirects));
  }

  logout(): void {
    this.closeAccountMenu();
    this.authFacade.logout();
  }

  private refreshUnreadCount(): void {
    this.notificationsApi.unreadCount().subscribe({
      next: (count) => this.unreadCount.set(Math.max(0, Math.trunc(count))),
      error: () => this.unreadCount.set(0),
    });
  }

  handleAccountAction(action: string): void {
    this.closeAccountMenu();
    if (action === 'account') {
      void this.router.navigate(['/seguridad']);
      return;
    }
    if (action === 'logout') this.logout();
  }

  toggleAccountMenu(): void {
    this.accountMenuOpen.update((open) => !open);
  }

  closeAccountMenu(): void {
    this.accountMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  closeAccountMenuFromOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) this.closeAccountMenu();
  }

  @HostListener('document:keydown.escape')
  closeAccountMenuFromEscape(): void {
    this.closeAccountMenu();
  }
}

export function findNavigationTitle(items: readonly NavItemData[], url: string): string {
  const matches: NavItemData[] = [];
  const visit = (candidates: readonly NavItemData[]): void => {
    for (const item of candidates) {
      if (item.route && (url === item.route || url.startsWith(`${item.route}/`)))
        matches.push(item);
      if (item.children) visit(item.children);
    }
  };
  visit(items);
  matches.sort((left, right) => (right.route?.length ?? 0) - (left.route?.length ?? 0));
  return matches[0]?.title ?? 'MisVales';
}
