import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthFacade } from '../../features/auth/state/auth.facade';
import { SessionStore } from '../../core/session/session.store';
import { NAV_GROUPS, BOTTOM_ITEMS, type NavItemData } from '../../shared/ui/sidebar/sidebar.config';
import { filterNavigationItems } from '../../shared/ui/sidebar/sidebar.permissions';

@Component({
  selector: 'app-mobile-layout',
  standalone: true,
  host: { '[class.distributor-mobile]': 'isDistributor()' },
  imports: [RouterLink, LucideAngularModule],
  template: `
    <a class="skip-link" href="#mobile-main">Saltar al contenido</a>
    <header class="mobile-header"><a routerLink="/inicio">MisVales</a></header>
    <main id="mobile-main" tabindex="-1"><ng-content /></main>
    <nav class="bottom-nav" aria-label="Navegación principal">
      @for (item of primaryItems(); track item.id) {
        <a [routerLink]="item.route" class="bottom-nav__item"><lucide-icon [name]="item.icon" [size]="20" /><span class="bottom-nav__label">{{ item.title }}</span></a>
      }
      <button type="button" class="bottom-nav__item" (click)="moreOpen.set(true)" aria-haspopup="dialog" [attr.aria-expanded]="moreOpen()"><lucide-icon name="menu" [size]="20" /><span class="bottom-nav__label">Más</span></button>
    </nav>
    @if (moreOpen()) {
      <section class="more-sheet" role="dialog" aria-modal="true" aria-label="Más opciones">
        <button type="button" class="close" (click)="moreOpen.set(false)">Cerrar</button>
        @for (item of moreItems(); track item.id) {
          @if (item.route) { <a [routerLink]="item.route" (click)="moreOpen.set(false)">{{ item.title }}</a> }
          @if (item.action === 'logout') { <button type="button" (click)="logout()">Cerrar sesión</button> }
        }
      </section>
    }
  `,
  styles: [`
    :host { display:block; min-height:100dvh; padding-bottom:84px; background:var(--mv-canvas); }
    .mobile-header { min-height:56px; display:flex; align-items:center; padding:0 16px; border-bottom:1px solid var(--mv-border); background:var(--mv-surface); }
    .mobile-header a { font-weight:700; color:var(--mv-text); text-decoration:none; }
    main { padding:16px; } .bottom-nav { position:fixed; z-index:20; inset:auto 0 0; min-height:76px; display:flex; justify-content:space-around; border-top:1px solid var(--mv-primary-700); background:var(--mv-primary-600); }
    .bottom-nav__item { flex:1 1 0; min-width:0; min-height:68px; padding:6px 2px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; border:0; color:#fff; background:transparent; font:inherit; font-size:.7rem; text-decoration:none; }
    .bottom-nav__item:hover, .bottom-nav__item:focus-visible { background:rgb(255 255 255 / .14); color:#fff; }
    .bottom-nav__item lucide-icon { flex:none; display:block; }
    .bottom-nav__label { display:grid; width:100%; min-height:2.2em; place-items:start center; overflow-wrap:anywhere; text-align:center; line-height:1.1; }
    .more-sheet { position:fixed; z-index:30; inset:auto 0 0; max-height:75dvh; overflow:auto; padding:20px; border-radius:16px 16px 0 0; background:var(--mv-primary-600); box-shadow:0 -8px 24px rgb(20 48 28 / .28); }
    .more-sheet a, .more-sheet button { min-height:48px; display:flex; align-items:center; width:100%; border:0; color:#fff; background:transparent; text-decoration:none; font:inherit; }
    .more-sheet a:hover, .more-sheet a:focus-visible, .more-sheet button:hover, .more-sheet button:focus-visible { background:rgb(255 255 255 / .14); color:#fff; }
    .close { justify-content:flex-end; font-weight:600 !important; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileLayoutComponent {
  private readonly session = inject(SessionStore);
  private readonly auth = inject(AuthFacade);
  readonly moreOpen = signal(false);
  readonly isDistributor = computed(() => this.session.roles().includes('distributor'));
  private readonly available = computed(() => [
    ...NAV_GROUPS.flatMap((group) => filterNavigationItems(group.items, this.session.permissions(), this.session.roles())),
    ...filterNavigationItems(BOTTOM_ITEMS, this.session.permissions(), this.session.roles()),
  ]);
  readonly primaryItems = computed(() => this.available().filter((item) => item.route).slice(0, 4));
  readonly moreItems = computed(() => {
    const primaryIds = new Set(this.primaryItems().map((item) => item.id));
    return this.available().filter((item) => !primaryIds.has(item.id));
  });

  logout(): void { this.auth.logout(); }
}
