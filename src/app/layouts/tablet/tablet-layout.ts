import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionStore } from '@core/session/session.store';
import { AuthFacade } from '@core/auth/state/auth.facade';
import { effectiveNavigationItems } from '@shared/utils/navigation/effective-navigation';
import { BOTTOM_ITEMS, navigationGroupsForRoles } from '@shared/utils/navigation/navigation.config';
import { TabletHeaderComponent } from './header/tablet-header.component';
import { TabletNavigationComponent } from './navigation/tablet-navigation.component';

@Component({
  selector: 'app-tablet-layout',
  standalone: true,
  imports: [RouterOutlet, TabletHeaderComponent, TabletNavigationComponent],
  template: `
    <a class="skip-link" href="#tablet-main">Saltar al contenido</a>
    <app-tablet-header
      [operationsCenterRoute]="operationsCenterRoute()"
      [workspaceLabel]="workspaceLabel()"
      [userName]="userName()"
      [initials]="initials()"
      (logoutRequested)="auth.logout()"
    />
    <main id="tablet-main" tabindex="-1" class="tablet-main"><router-outlet /></main>
    <app-tablet-navigation [primaryItems]="primaryItems()" />
  `,
  styles: `
    :host {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      width: 100%;
      max-width: 100vw;
      height: 100dvh;
      overflow: hidden;
      color: var(--mv-text);
      background: var(--mv-canvas);
    }
    .tablet-main {
      position: relative;
      z-index: 0;
      isolation: isolate;
      min-width: 0;
      min-height: 0;
      padding: clamp(1.25rem, 3vw, 2.5rem);
      overflow: auto;
      overscroll-behavior: contain;
      scroll-padding-top: 1.5rem;
      background: radial-gradient(circle at 100% 0, rgb(14 165 88 / 5%), transparent 21rem);
    }
    .tablet-main > * {
      width: min(100%, 92rem);
      margin-inline: auto;
    }
    @media (max-width: 680px) {
      .tablet-main {
        padding: 1rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabletLayoutComponent {
  private readonly session = inject(SessionStore);
  protected readonly auth = inject(AuthFacade);
  readonly availableItems = computed(() =>
    effectiveNavigationItems(
      navigationGroupsForRoles(this.session.roles()),
      BOTTOM_ITEMS,
      this.session.permissions(),
      this.session.roles(),
    ),
  );
  readonly primaryItems = computed(() =>
    tabletPrimaryItems(this.session.roles(), this.availableItems()),
  );
  readonly operationsCenterRoute = computed(
    () => this.availableItems().find((item) => item.id === 'operations-center')?.route ?? null,
  );
  readonly userName = computed(() => this.session.user()?.name ?? 'Mi cuenta');
  readonly initials = computed(() => initialsFor(this.userName()));
  readonly workspaceLabel = computed(() => {
    const roles = this.session.roles();
    if (roles.includes('coordinator')) return 'Coordinación';
    if (roles.includes('verifier')) return 'Verificación';
    return 'Operación';
  });
}

function tabletPrimaryItems(
  roles: readonly string[],
  available: readonly ReturnType<typeof effectiveNavigationItems>[number][],
) {
  if (roles.includes('coordinator')) {
    const dashboard = available.find((item) => item.id === 'dashboard');
    return [
      dashboard,
      {
        id: 'coordinator-distributors',
        title: 'Distribuidoras',
        icon: 'store',
        route: '/coordinacion/distribuidoras',
        group: 'Coordinación',
      },
      {
        id: 'coordinator-pending',
        title: 'Pendientes',
        icon: 'clipboard-list',
        route: '/coordinacion/pendientes',
        group: 'Coordinación',
      },
      {
        id: 'coordinator-alerts',
        title: 'Alertas',
        icon: 'triangle-alert',
        route: '/coordinacion/alertas',
        group: 'Coordinación',
      },
    ].filter((item) => item !== undefined);
  }

  return available.filter((item) => item.route && item.group !== 'Cuenta').slice(0, 5);
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
