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
  imports: [RouterLink, LucideAngularModule],
  template: `
    <a class="skip-link" href="#mobile-main">Saltar al contenido</a>
    <header class="mobile-header"><a routerLink="/inicio">MisVales</a></header>
    <main id="mobile-main" tabindex="-1"><ng-content /></main>
    <nav class="bottom-nav" aria-label="Navegación principal">
      @for (item of primaryItems(); track item.id) {
        <a [routerLink]="item.route" class="bottom-nav__item"><lucide-icon [name]="item.icon" [size]="20" />{{ item.title }}</a>
      }
      <button type="button" class="bottom-nav__item" (click)="moreOpen.set(true)" aria-haspopup="dialog" [attr.aria-expanded]="moreOpen()"><lucide-icon name="menu" [size]="20" />Más</button>
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
    :host { display:block; min-height:100dvh; padding-bottom:76px; background:var(--mv-canvas); }
    .mobile-header { min-height:56px; display:flex; align-items:center; padding:0 16px; border-bottom:1px solid var(--mv-border); background:var(--mv-surface); }
    .mobile-header a { font-weight:700; color:var(--mv-text); text-decoration:none; }
    main { padding:16px; } .bottom-nav { position:fixed; z-index:20; inset:auto 0 0; min-height:68px; display:flex; justify-content:space-around; border-top:1px solid var(--mv-border); background:var(--mv-surface); }
    .bottom-nav__item { flex:1; min-width:48px; min-height:60px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; border:0; color:var(--mv-text); background:transparent; font:inherit; font-size:.72rem; text-decoration:none; }
    .more-sheet { position:fixed; z-index:30; inset:auto 0 0; max-height:75dvh; overflow:auto; padding:20px; border-radius:16px 16px 0 0; background:var(--mv-surface); box-shadow:0 -8px 24px rgb(0 0 0 / .18); }
    .more-sheet a, .more-sheet button { min-height:48px; display:flex; align-items:center; width:100%; color:var(--mv-text); background:transparent; border:0; text-decoration:none; font:inherit; }
    .close { justify-content:flex-end; font-weight:600 !important; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileLayoutComponent {
  private readonly session = inject(SessionStore);
  private readonly auth = inject(AuthFacade);
  readonly moreOpen = signal(false);
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
