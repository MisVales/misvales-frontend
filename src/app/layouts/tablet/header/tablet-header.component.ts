import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  inject,
  Output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BrandLockupComponent } from '@shared/components/brand/brand-lockup/brand-lockup.component';
import { DistributorWorkspaceNavComponent } from '@shared/components/navigation/distributor-workspace-nav/distributor-workspace-nav.component';
import { DistributorWorkspaceContextService } from '@shared/components/navigation/distributor-workspace-nav/distributor-workspace-context.service';
import { AuthFacade } from '@core/auth/state/auth.facade';
import { AuthService, type LocalSwitchAccount } from '@core/auth/data-access/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-tablet-header',
  standalone: true,
  imports: [
    BrandLockupComponent,
    DistributorWorkspaceNavComponent,
    LucideAngularModule,
    RouterLink,
  ],
  template: `
    <header class="tablet-header">
      <app-brand-lockup variant="horizontal" />

      @if (distributorWorkspace.current(); as context) {
        <app-distributor-workspace-nav
          class="header-workspace-nav"
          [distributorId]="context.distributorId"
          [distributorNumber]="context.distributorNumber"
          [active]="context.active"
          [backRoute]="context.backRoute"
          variant="header"
        />
      } @else {
        <div class="workspace" aria-label="Contexto de trabajo">
          <span>Vista actual</span>
          <strong>{{ workspaceLabel }}</strong>
        </div>
      }

      @if (operationsCenterRoute) {
        <a
          class="icon-button"
          [routerLink]="operationsCenterRoute"
          aria-label="Abrir notificaciones"
        >
          <lucide-icon name="bell" [size]="21" aria-hidden="true" />
        </a>
      }
      <div class="profile-menu">
        <button
          type="button"
          class="profile-trigger"
          aria-haspopup="menu"
          [attr.aria-expanded]="profileOpen()"
          (click)="$event.stopPropagation(); profileOpen.update((open) => !open)"
        >
          <span class="profile-avatar" aria-hidden="true">{{ initials }}</span>
          <span class="profile-name">{{ userName }}</span>
          <lucide-icon name="chevron-down" [size]="17" aria-hidden="true" />
        </button>
        @if (profileOpen()) {
          <div class="profile-dropdown" role="menu" aria-label="Opciones de cuenta">
            <div class="profile-summary">
              <span>{{ workspaceLabel }}</span>
              <strong>{{ userName }}</strong>
            </div>
            <a role="menuitem" routerLink="/seguridad" (click)="profileOpen.set(false)">
              <lucide-icon name="circle-user-round" [size]="19" aria-hidden="true" /> Perfil y
              seguridad
            </a>
            @if (localAccountSwitchEnabled) {
              <section class="local-switch" aria-label="Cambiar cuenta local">
                <button type="button" class="local-switch-trigger" (click)="toggleLocalSwitch($event)">
                  <lucide-icon name="users-round" [size]="19" aria-hidden="true" /> Cambiar cuenta
                  <lucide-icon name="chevron-down" [size]="15" aria-hidden="true" />
                </button>
                @if (localSwitchOpen()) {
                  <div class="local-switch-fields">
                    <label for="tablet-local-demo-account">Cuentas demo</label>
                    <select id="tablet-local-demo-account" [disabled]="localAccountsLoading() || authFacade.isLoading()" (change)="selectLocalAccount($event)">
                      <option value="">Selecciona una cuenta</option>
                      @for (account of localAccounts(); track account.id) {
                        <option [value]="account.id">{{ account.role_name }} · {{ account.name }}</option>
                      }
                    </select>
                    <label for="tablet-local-distributor-account">Distribuidoras</label>
                    <select id="tablet-local-distributor-account" [disabled]="!localDistributors().length || localAccountsLoading() || authFacade.isLoading()" (change)="selectLocalAccount($event)">
                      <option value="">{{ localDistributors().length ? 'Selecciona una distribuidora' : 'Sin distribuidoras activas' }}</option>
                      @for (account of localDistributors(); track account.id) {
                        <option [value]="account.id">{{ account.distributor_number }} · {{ account.name }}</option>
                      }
                    </select>
                    @if (localAccountsError()) { <small class="local-switch-error">{{ localAccountsError() }}</small> }
                  </div>
                }
              </section>
            }
            <button
              type="button"
              role="menuitem"
              (click)="profileOpen.set(false); logoutRequested.emit()"
            >
              <lucide-icon name="log-out" [size]="19" aria-hidden="true" /> Cerrar sesión
            </button>
          </div>
        }
      </div>
    </header>
  `,
  styles: `
    :host {
      position: relative;
      z-index: 100;
      display: block;
      overflow: visible;
    }
    .tablet-header {
      position: relative;
      z-index: 1;
      min-height: 5.7rem;
      display: grid;
      grid-template-columns: auto minmax(40rem, 1fr) auto auto;
      align-items: center;
      gap: 0.8rem;
      padding: max(0.7rem, env(safe-area-inset-top)) clamp(1rem, 2.5vw, 2rem) 0.7rem;
      border-bottom: 1px solid var(--mv-border);
      background: color-mix(in srgb, var(--mv-surface) 96%, transparent);
      backdrop-filter: blur(14px);
    }
    .tablet-header app-brand-lockup {
      --brand-logo-width: clamp(8.5rem, 18vw, 10.5rem);
    }
    .header-workspace-nav {
      position: static;
      width: 100%;
      min-width: 0;
      min-height: 4.15rem;
      display: block;
      align-self: stretch;
      overflow: visible;
      opacity: 1;
      visibility: visible;
    }
    .icon-button {
      width: 2.75rem;
      height: 2.75rem;
      flex: 0 0 auto;
      display: inline-grid;
      place-items: center;
      border: 1px solid var(--mv-border);
      border-radius: 0.8rem;
      color: var(--mv-text);
      background: var(--mv-surface);
      text-decoration: none;
      touch-action: manipulation;
    }
    .icon-button {
      padding: 0;
      font: inherit;
      cursor: pointer;
    }
    .icon-button:hover {
      border-color: var(--mv-primary-300);
      background: var(--mv-primary-50);
    }
    .profile-menu {
      position: relative;
      z-index: 2;
    }
    .profile-trigger {
      min-height: 2.75rem;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.3rem 0.55rem 0.3rem 0.35rem;
      border: 1px solid var(--mv-border);
      border-radius: 0.8rem;
      color: var(--mv-text);
      background: var(--mv-surface);
      font: inherit;
      cursor: pointer;
    }
    .profile-trigger:hover {
      border-color: var(--mv-primary-300);
      background: var(--mv-primary-50);
    }
    .profile-avatar {
      width: 2rem;
      height: 2rem;
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: var(--mv-primary-700);
      background: var(--mv-primary-100);
      font-size: 0.72rem;
      font-weight: 800;
    }
    .profile-name {
      max-width: 11rem;
      overflow: hidden;
      font-size: 0.78rem;
      font-weight: 750;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .profile-dropdown {
      position: absolute;
      z-index: 10;
      top: calc(100% + 0.5rem);
      right: 0;
      width: min(18rem, calc(100vw - 1.5rem));
      padding: 0.45rem;
      border: 1px solid var(--mv-border);
      border-radius: 0.85rem;
      background: var(--mv-surface);
      box-shadow: var(--mv-shadow-drawer);
    }
    .profile-summary {
      display: grid;
      gap: 0.12rem;
      padding: 0.55rem 0.65rem 0.7rem;
      border-bottom: 1px solid var(--mv-border);
    }
    .profile-summary span {
      color: var(--mv-text-muted);
      font-size: 0.67rem;
    }
    .profile-summary strong {
      overflow: hidden;
      font-size: 0.82rem;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .profile-dropdown :is(a, button) {
      width: 100%;
      min-height: 2.75rem;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.55rem 0.65rem;
      border: 0;
      border-radius: 0.6rem;
      color: var(--mv-text);
      background: transparent;
      font: inherit;
      font-size: 0.76rem;
      font-weight: 700;
      text-align: left;
      text-decoration: none;
      cursor: pointer;
    }
    .profile-dropdown :is(a, button):hover {
      color: var(--mv-primary-700);
      background: var(--mv-primary-50);
    }
    .profile-dropdown button:last-child {
      color: var(--mv-danger);
    }
    .local-switch { margin: 0.35rem 0; border-block: 1px solid var(--mv-border); padding-block: 0.25rem; }
    .local-switch-trigger { width: 100%; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 0.65rem; padding: 0.65rem; border: 0; border-radius: 0.6rem; color: var(--mv-text); background: transparent; font: inherit; font-size: 0.76rem; font-weight: 700; text-align: left; cursor: pointer; }
    .local-switch-trigger:hover { background: var(--mv-primary-50); color: var(--mv-primary-700); }
    .local-switch-fields { display: grid; gap: 0.35rem; padding: 0.35rem 0.65rem 0.65rem; }
    .local-switch-fields label { margin-top: 0.25rem; color: var(--mv-text-muted); font-size: 0.67rem; font-weight: 750; text-transform: uppercase; }
    .local-switch-fields select { width: 100%; border: 1px solid var(--mv-border); border-radius: 0.5rem; background: var(--mv-surface); padding: 0.55rem; color: var(--mv-text); font: inherit; font-size: 0.72rem; }
    .local-switch-error { color: var(--mv-danger); }
    .workspace {
      width: 100%;
      min-width: 0;
      padding-right: 0.5rem;
      display: grid;
      justify-items: end;
      line-height: 1.2;
    }
    .workspace span {
      color: var(--mv-text-muted);
      font-size: 0.72rem;
      font-weight: 650;
    }
    .workspace strong {
      max-width: 12rem;
      overflow: hidden;
      font-size: 0.86rem;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    @media (max-width: 1180px) {
      .tablet-header {
        grid-template-columns: auto minmax(7rem, 1fr) 2.75rem auto;
      }
      .header-workspace-nav {
        grid-column: 1 / -1;
        grid-row: 2;
      }
      .profile-name {
        display: none;
      }
    }
    @media (max-width: 900px) {
      .workspace {
        display: none;
      }
      .tablet-header {
        grid-template-columns: minmax(0, 1fr) auto auto;
      }
    }
    @media (max-width: 680px) {
      .tablet-header {
        padding-inline: 0.75rem;
      }
      .tablet-header app-brand-lockup {
        grid-column: auto;
      }
      .profile-name {
        display: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabletHeaderComponent {
  protected readonly distributorWorkspace = inject(DistributorWorkspaceContextService);
  readonly authFacade = inject(AuthFacade);
  private readonly authService = inject(AuthService);
  @Input() operationsCenterRoute: string | null = null;
  @Input() workspaceLabel = '';
  @Input() userName = '';
  @Input() initials = '';
  @Output() readonly logoutRequested = new EventEmitter<void>();
  readonly profileOpen = signal(false);
  readonly localAccountSwitchEnabled = !environment.production;
  readonly localSwitchOpen = signal(false);
  readonly localAccountsLoading = signal(false);
  readonly localAccountsError = signal('');
  readonly localAccounts = signal<LocalSwitchAccount[]>([]);
  readonly localDistributors = signal<LocalSwitchAccount[]>([]);

  selectLocalAccount(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const userId = select.value;
    select.value = '';
    if (!userId || this.authFacade.isLoading()) return;
    void this.authFacade.switchLocalAccount(userId).then((changed) => {
      if (changed) {
        this.profileOpen.set(false);
        this.localSwitchOpen.set(false);
      }
    });
  }

  toggleLocalSwitch(event: MouseEvent): void {
    event.stopPropagation();
    this.localSwitchOpen.update((open) => !open);
    if (this.localSwitchOpen()) this.loadLocalAccounts();
  }

  private loadLocalAccounts(): void {
    if (this.localAccounts().length || this.localAccountsLoading()) return;
    this.localAccountsLoading.set(true);
    this.authService.localAccounts().subscribe({
      next: (data) => { this.localAccounts.set(data.accounts); this.localDistributors.set(data.distributors); this.localAccountsLoading.set(false); },
      error: () => { this.localAccountsError.set('No fue posible cargar las cuentas locales.'); this.localAccountsLoading.set(false); },
    });
  }

  @HostListener('document:click')
  closeProfile(): void {
    this.profileOpen.set(false);
    this.localSwitchOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeProfileWithKeyboard(): void {
    this.profileOpen.set(false);
  }
}
