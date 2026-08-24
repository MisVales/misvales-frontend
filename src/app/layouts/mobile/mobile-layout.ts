import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionStore } from '@core/session/session.store';
import { AuthFacade } from '@core/auth/state/auth.facade';
import { effectiveNavigationItems } from '@shared/utils/navigation/effective-navigation';
import { BOTTOM_ITEMS, NAV_GROUPS } from '@shared/utils/navigation/navigation.config';
import { MobileHeaderComponent } from './header/mobile-header.component';
import { MobileNavigationComponent } from './bottom-navigation/mobile-navigation.component';
import type { MobileNavigationSection } from './bottom-navigation/mobile-navigation.component';

@Component({
  selector: 'app-mobile-layout',
  standalone: true,
  host: { class: 'distributor-mobile' },
  imports: [RouterOutlet, MobileHeaderComponent, MobileNavigationComponent],
  template: `
    <a class="skip-link" href="#mobile-main">Saltar al contenido</a>
    <app-mobile-header
      [operationsCenterRoute]="operationsCenterRoute()"
      [initials]="initials()"
      (logoutRequested)="logout()"
    />
    <main id="mobile-main" tabindex="-1"><router-outlet /></main>
    <app-mobile-navigation [sections]="navigationSections()" />
  `,
  styles: `
    :host {
      position: relative;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      width: min(100%, 30rem);
      height: 100dvh;
      margin-inline: auto;
      overflow: hidden;
      border-inline: 1px solid var(--mv-border);
      color: var(--mv-text);
      background: var(--mv-canvas);
      box-shadow: 0 0 3rem rgb(20 48 33 / 12%);
      contain: paint;
    }
    main {
      min-width: 0;
      min-height: 0;
      padding: 1rem;
      overflow-y: auto;
      overscroll-behavior: contain;
      scroll-padding-top: 1rem;
      background:
        linear-gradient(180deg, rgb(14 165 88 / 5%) 0, transparent 12rem), var(--mv-canvas);
    }
    main > * {
      width: 100%;
      margin-inline: auto;
    }
    @media (max-width: 30rem) {
      :host {
        border-inline: 0;
        box-shadow: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileLayoutComponent {
  private readonly session = inject(SessionStore);
  private readonly auth = inject(AuthFacade);
  readonly availableItems = computed(() =>
    effectiveNavigationItems(
      NAV_GROUPS,
      BOTTOM_ITEMS,
      this.session.permissions(),
      this.session.roles(),
    ),
  );
  readonly navigationSections = computed<MobileNavigationSection[]>(() => {
    const items = this.availableItems();
    const pick = (...ids: string[]) => items.filter((item) => ids.includes(item.id));
    return [
      { id: 'credit', title: 'Crédito', icon: 'wallet', route: pick('credit-lines')[0]?.route },
      { id: 'vouchers', title: 'Vales', icon: 'ticket', route: pick('vouchers')[0]?.route },
      { id: 'home', title: 'Inicio', icon: 'layout-dashboard', route: '/inicio', prominent: true },
      { id: 'payments', title: 'Pagos', icon: 'credit-card', route: pick('payments')[0]?.route },
      { id: 'account', title: 'Cuenta', icon: 'circle-user-round', route: '/seguridad' },
    ];
  });
  readonly operationsCenterRoute = computed(
    () => this.availableItems().find((item) => item.id === 'operations-center')?.route ?? null,
  );
  readonly initials = computed(() => initialsFor(this.session.user()?.name ?? 'Mi cuenta'));

  logout(): void {
    this.auth.logout();
  }
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
