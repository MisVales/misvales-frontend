import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SessionStore } from '../../core/session/session.store';
import { NAV_GROUPS, type NavItemData } from '../../shared/ui/sidebar/sidebar.config';
import { filterNavigationItems } from '../../shared/ui/sidebar/sidebar.permissions';

@Component({
  selector: 'app-tablet-layout',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <a class="skip-link" href="#tablet-main">Saltar al contenido</a>
    <header class="tablet-header"><a routerLink="/inicio" class="brand">MisVales</a></header>
    <nav class="tablet-nav" aria-label="Navegación principal">
      @for (item of items(); track item.id) {
        @if (item.route) {
          <a [routerLink]="item.route" class="tablet-nav__item"><lucide-icon [name]="item.icon" [size]="22" />{{ item.title }}</a>
        }
      }
    </nav>
    <main id="tablet-main" tabindex="-1"><ng-content /></main>
  `,
  styles: [`
    :host { display:block; min-height:100dvh; background:var(--mv-canvas); }
    .tablet-header { min-height:64px; display:flex; align-items:center; padding:0 24px; border-bottom:1px solid var(--mv-border); background:var(--mv-surface); }
    .brand { font-weight:700; color:var(--mv-text); text-decoration:none; }
    .tablet-nav { display:flex; gap:8px; overflow-x:auto; padding:10px 16px; border-bottom:1px solid var(--mv-border); background:var(--mv-surface); }
    .tablet-nav__item { min-height:48px; min-width:48px; display:inline-flex; align-items:center; gap:8px; white-space:nowrap; padding:0 14px; border-radius:8px; color:var(--mv-text); text-decoration:none; }
    .tablet-nav__item:focus-visible { outline:3px solid var(--mv-primary); outline-offset:2px; }
    main { padding:clamp(1rem, 2.2vw, 2rem); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabletLayoutComponent {
  private readonly session = inject(SessionStore);
  readonly items = computed(() => flattenNavigation(this.session.permissions(), this.session.roles()));
}

function flattenNavigation(permissions: readonly string[], roles: readonly string[]): NavItemData[] {
  return NAV_GROUPS.flatMap((group) => filterNavigationItems(group.items, permissions, roles));
}
