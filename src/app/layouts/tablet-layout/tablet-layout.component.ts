import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthFacade } from '../../features/auth/state/auth.facade';
import { SessionStore } from '../../core/session/session.store';
import {
  BOTTOM_ITEMS,
  NAV_GROUPS,
  type NavGroupData,
  type NavItemData,
} from '../../shared/ui/sidebar/sidebar.config';
import { filterNavigationItems } from '../../shared/ui/sidebar/sidebar.permissions';

interface TabletNavGroup extends Pick<NavGroupData, 'heading' | 'icon'> {
  items: NavItemData[];
}

@Component({
  selector: 'app-tablet-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <a class="skip-link" href="#tablet-main">Saltar al contenido</a>
    <header class="tablet-header">
      <button type="button" class="nav-toggle" aria-label="Abrir navegación" [attr.aria-expanded]="navigationOpen()" (click)="navigationOpen.set(true)">
        <lucide-icon name="menu" [size]="24" />
      </button>
      <a routerLink="/inicio" class="brand" aria-label="MisVales, ir al inicio">
        <span class="brand__mark" aria-hidden="true">MV</span><span>MisVales</span>
      </a>
      <div class="workspace" aria-label="Contexto de trabajo">
        <span class="workspace__eyebrow">Espacio de trabajo</span><strong>{{ workspaceLabel() }}</strong>
      </div>
    </header>

    @if (navigationOpen()) {
      <button type="button" class="tablet-scrim" aria-label="Cerrar navegación" (click)="navigationOpen.set(false)"></button>
    }

    <aside class="tablet-sidebar" [class.tablet-sidebar--open]="navigationOpen()">
      <div class="sidebar__title">
        <span>Operación</span>
        <button type="button" class="close-nav" aria-label="Cerrar navegación" (click)="navigationOpen.set(false)"><lucide-icon name="x" [size]="22" /></button>
      </div>
      <nav aria-label="Módulos disponibles" class="sidebar__navigation">
        @for (group of navigationGroups(); track group.heading) {
          <section class="nav-group">
            <p class="nav-group__label">{{ group.heading }}</p>
            @for (item of group.items; track item.id) {
              @if (item.route) {
                <a [routerLink]="item.route" routerLinkActive="nav-link--active" [routerLinkActiveOptions]="{ exact: item.route === '/inicio' }" class="nav-link" (click)="navigationOpen.set(false)">
                  <lucide-icon [name]="item.icon" [size]="20" aria-hidden="true" /><span>{{ item.title }}</span>
                </a>
              }
            }
          </section>
        }
      </nav>
      <div class="sidebar__footer">
        @for (item of accountItems(); track item.id) {
          @if (item.route) {
            <a [routerLink]="item.route" routerLinkActive="nav-link--active" class="nav-link" (click)="navigationOpen.set(false)">
              <lucide-icon [name]="item.icon" [size]="20" aria-hidden="true" /><span>{{ item.title }}</span>
            </a>
          }
          @if (item.action === 'logout') {
            <button type="button" class="nav-link nav-link--logout" (click)="logout()"><lucide-icon [name]="item.icon" [size]="20" aria-hidden="true" /><span>{{ item.title }}</span></button>
          }
        }
      </div>
    </aside>

    <main id="tablet-main" tabindex="-1" class="tablet-main"><ng-content /></main>
  `,
  styles: [`
    :host { display:grid; grid-template-columns:minmax(0, 1fr); grid-template-rows:auto minmax(0, 1fr); height:100dvh; overflow:hidden; background:var(--mv-canvas); color:var(--mv-text); }
    .tablet-header { grid-column:1 / -1; grid-row:1; z-index:20; min-height:72px; display:flex; align-items:center; gap:16px; padding:max(12px, env(safe-area-inset-top)) 24px 12px; border-bottom:1px solid var(--mv-border); background:var(--mv-surface); }
    .brand { display:inline-flex; align-items:center; gap:10px; color:var(--mv-text); font-size:1.125rem; font-weight:760; letter-spacing:-.02em; text-decoration:none; }
    .brand__mark { display:grid; place-items:center; width:36px; height:36px; border-radius:10px; background:var(--mv-primary-800); color:var(--mv-surface); font-size:.75rem; font-weight:800; letter-spacing:.04em; }
    .workspace { display:grid; gap:1px; margin-left:auto; text-align:right; }
    .workspace__eyebrow, .nav-group__label { color:var(--mv-text-muted); font-size:.6875rem; font-weight:750; letter-spacing:.08em; text-transform:uppercase; }
    .workspace strong { font-size:.9375rem; }
    .nav-toggle, .close-nav { display:inline-grid; place-items:center; width:48px; height:48px; padding:0; border:0; border-radius:var(--mv-radius-sm); color:var(--mv-text); background:transparent; touch-action:manipulation; }
    .nav-toggle:active, .close-nav:active, .nav-link:active { background:var(--mv-primary-100); transform:scale(.98); }
    .tablet-sidebar { position:fixed; z-index:40; inset:0 auto 0 0; min-block-size:0; width:min(320px, calc(100vw - 48px)); display:flex; flex-direction:column; padding:max(16px, env(safe-area-inset-top)) 12px max(16px, env(safe-area-inset-bottom)); overflow-y:auto; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; border-right:1px solid var(--mv-border); background:var(--mv-surface); box-shadow:12px 0 28px rgb(24 33 27 / .14); transform:translateX(-104%); transition:transform var(--mv-motion-standard) var(--mv-ease); }
    .tablet-sidebar--open { transform:translateX(0); }
    .tablet-scrim { position:fixed; z-index:30; inset:0; border:0; background:rgb(24 33 27 / .42); }
    .sidebar__title { min-height:48px; display:flex; align-items:center; justify-content:space-between; padding:0 8px 12px 12px; color:var(--mv-text); font-weight:760; }
    .sidebar__navigation { display:grid; gap:24px; padding:12px 0 24px; }
    .nav-group { display:grid; gap:6px; }
    .nav-group__label { margin:0; padding:0 12px 5px; }
    .nav-link { min-height:48px; display:flex; align-items:center; gap:12px; width:100%; padding:0 12px; border:0; border-radius:var(--mv-radius-sm); color:var(--mv-text-muted); background:transparent; font:inherit; font-size:.9375rem; font-weight:560; line-height:1.25; text-align:left; text-decoration:none; touch-action:manipulation; }
    .nav-link lucide-icon { flex:0 0 auto; color:var(--mv-text-muted); }
    .nav-link--active { color:var(--mv-primary-800); background:var(--mv-primary-50); font-weight:720; }
    .nav-link--active lucide-icon { color:var(--mv-primary-600); }
    .nav-link--logout { margin-top:8px; cursor:pointer; }
    .sidebar__footer { display:grid; gap:4px; margin-top:auto; padding-top:16px; border-top:1px solid var(--mv-border); }
    .tablet-main { grid-column:1; grid-row:2; min-width:0; min-block-size:0; padding:clamp(24px, 3vw, 40px); overflow:auto; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; scroll-padding-top:24px; }
    @media (min-width:900px) { :host { grid-template-columns:272px minmax(0, 1fr); } .tablet-header { padding-inline:28px; } .nav-toggle, .close-nav, .tablet-scrim { display:none; } .tablet-sidebar { position:relative; grid-column:1; grid-row:2; width:auto; inset:auto; padding:20px 14px; box-shadow:none; transform:none; } .tablet-main { grid-column:2; } .sidebar__title { padding-left:12px; } }
    @media (max-width:520px) { .tablet-header { gap:10px; padding-inline:12px; } .workspace { display:none; } .tablet-main { padding:16px; } }
    @media (prefers-reduced-motion:reduce) { .tablet-sidebar { transition:none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabletLayoutComponent {
  private readonly session = inject(SessionStore);
  private readonly auth = inject(AuthFacade);
  readonly navigationOpen = signal(false);

  readonly navigationGroups = computed<TabletNavGroup[]>(() => {
    const permissions = this.session.permissions();
    const roles = this.session.roles();
    return NAV_GROUPS
      .map((group) => ({ heading: group.heading, icon: group.icon, items: flattenNavigableItems(filterNavigationItems(group.items, permissions, roles)) }))
      .filter((group) => group.items.length > 0);
  });

  readonly accountItems = computed(() => flattenNavigableItems(filterNavigationItems(BOTTOM_ITEMS, this.session.permissions(), this.session.roles())));

  readonly workspaceLabel = computed(() => {
    const roles = this.session.roles();
    if (roles.includes('coordinator')) return 'Coordinación';
    if (roles.includes('verifier')) return 'Verificación';
    return 'Operación';
  });

  logout(): void { this.auth.logout(); }
}

function flattenNavigableItems(items: readonly NavItemData[]): NavItemData[] {
  return items.flatMap((item) => {
    const ownItem = item.route || item.action ? [{ ...item, children: undefined }] : [];
    return [...ownItem, ...flattenNavigableItems(item.children ?? [])];
  });
}
