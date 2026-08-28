import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BrandLockupComponent } from '@shared/components/brand/brand-lockup/brand-lockup.component';
import { AuthFacade } from '@core/auth/state/auth.facade';
import { AuthService, type LocalSwitchAccount } from '@core/auth/data-access/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [BrandLockupComponent, LucideAngularModule, RouterLink],
  template: `
    <header class="mobile-header">
      <app-brand-lockup />
      @if (operationsCenterRoute) {
        <a
          class="header-action"
          [routerLink]="operationsCenterRoute"
          aria-label="Abrir notificaciones"
        >
          <lucide-icon name="bell" [size]="21" aria-hidden="true" />
        </a>
      }
      <details class="profile-menu" #profileMenu>
        <summary class="profile-link" aria-label="Abrir menú de perfil y seguridad"><span aria-hidden="true">{{ initials }}</span></summary>
        <div class="profile-dropdown" aria-label="Opciones de cuenta">
          @if (localAccountSwitchEnabled) {
            <section class="local-switch" aria-label="Cambiar cuenta local">
              <button type="button" class="local-switch-trigger" (click)="toggleLocalSwitch($event)">
                <lucide-icon name="users-round" [size]="19" aria-hidden="true" /> Cambiar cuenta
                <lucide-icon name="chevron-down" [size]="15" aria-hidden="true" />
              </button>
              @if (localSwitchOpen()) {
                <div class="local-switch-fields">
                  <label for="mobile-local-demo-account">Cuentas demo</label>
                  <select id="mobile-local-demo-account" [disabled]="localAccountsLoading() || authFacade.isLoading()" (change)="selectLocalAccount($event)">
                    <option value="">Selecciona una cuenta</option>
                    @for (account of localAccounts(); track account.id) { <option [value]="account.id">{{ account.role_name }} · {{ account.name }}</option> }
                  </select>
                  <label for="mobile-local-distributor-account">Distribuidoras</label>
                  <select id="mobile-local-distributor-account" [disabled]="!localDistributors().length || localAccountsLoading() || authFacade.isLoading()" (change)="selectLocalAccount($event)">
                    <option value="">{{ localDistributors().length ? 'Selecciona una distribuidora' : 'Sin distribuidoras activas' }}</option>
                    @for (account of localDistributors(); track account.id) { <option [value]="account.id">{{ account.distributor_number }} · {{ account.name }}</option> }
                  </select>
                  @if (localAccountsError()) { <small class="local-switch-error">{{ localAccountsError() }}</small> }
                </div>
              }
            </section>
          }
          <a routerLink="/seguridad" (click)="profileMenu.open = false"><lucide-icon name="shield-check" [size]="19" aria-hidden="true" /> Perfil y seguridad</a>
          <button type="button" (click)="profileMenu.open = false; logoutRequested.emit()"><lucide-icon name="log-out" [size]="19" aria-hidden="true" /> Cerrar sesión</button>
        </div>
      </details>
    </header>
  `,
  styles: `
    .mobile-header {
      z-index: 20;
      min-height: 4rem;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      padding: max(0.55rem, env(safe-area-inset-top)) 0.9rem 0.55rem;
      border-bottom: 1px solid var(--mv-border);
      background: color-mix(in srgb, var(--mv-surface) 97%, transparent);
      backdrop-filter: blur(14px);
    }
    .mobile-header app-brand-lockup {
      margin-right: auto;
    }
    .header-action,
    .profile-link {
      width: 2.75rem;
      height: 2.75rem;
      flex: 0 0 auto;
      display: inline-grid;
      place-items: center;
      border-radius: 0.8rem;
      color: var(--mv-text);
      text-decoration: none;
    }
    .header-action {
      border: 1px solid var(--mv-border);
      background: var(--mv-surface);
    }
    .profile-link > span {
      display: grid;
      width: 2.25rem;
      height: 2.25rem;
      place-items: center;
      border-radius: 50%;
      background: var(--mv-primary-100);
      color: var(--mv-primary-700);
      font-size: 0.72rem;
      font-weight: 800;
    }
    .profile-menu { position: relative; }
    .profile-link { list-style: none; cursor: pointer; }
    .profile-link::-webkit-details-marker { display: none; }
    .profile-link:focus-visible { outline: 3px solid color-mix(in srgb, var(--mv-primary-600) 45%, transparent); outline-offset: 2px; }
    .profile-dropdown { position: absolute; z-index: 60; top: calc(100% + .55rem); right: 0; width: 13.5rem; display: grid; gap: .2rem; padding: .45rem; border: 1px solid var(--mv-border); border-radius: .95rem; background: var(--mv-surface); box-shadow: var(--mv-shadow-sheet); }
    .profile-dropdown a, .profile-dropdown button { min-height: 2.9rem; display: flex; align-items: center; gap: .65rem; padding: .55rem .7rem; border: 0; border-radius: .65rem; color: var(--mv-text); background: transparent; font: inherit; font-size: .84rem; font-weight: 700; text-align: left; text-decoration: none; }
    .profile-dropdown a:hover, .profile-dropdown button:hover { color: var(--mv-primary-700); background: var(--mv-primary-50); }
    .local-switch { margin: .2rem 0; border-block: 1px solid var(--mv-border); padding-block: .25rem; }
    .local-switch-trigger { width: 100%; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: .65rem; padding: .65rem .7rem; border: 0; border-radius: .65rem; color: var(--mv-text); background: transparent; font: inherit; font-size: .84rem; font-weight: 700; text-align: left; cursor: pointer; }
    .local-switch-trigger:hover { color: var(--mv-primary-700); background: var(--mv-primary-50); }
    .local-switch-fields { display: grid; gap: .35rem; padding: .35rem .7rem .65rem; }
    .local-switch-fields label { margin-top: .25rem; color: var(--mv-text-muted); font-size: .67rem; font-weight: 750; text-transform: uppercase; }
    .local-switch-fields select { width: 100%; border: 1px solid var(--mv-border); border-radius: .5rem; background: var(--mv-surface); padding: .55rem; color: var(--mv-text); font: inherit; font-size: .72rem; }
    .local-switch-error { color: var(--mv-danger); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileHeaderComponent {
  readonly authFacade = inject(AuthFacade);
  private readonly authService = inject(AuthService);
  @Input() operationsCenterRoute: string | null = null;
  @Input() initials = '';
  @Output() readonly logoutRequested = new EventEmitter<void>();
  readonly localAccountSwitchEnabled = !environment.production;
  readonly localSwitchOpen = signal(false);
  readonly localAccountsLoading = signal(false);
  readonly localAccountsError = signal('');
  readonly localAccounts = signal<LocalSwitchAccount[]>([]);
  readonly localDistributors = signal<LocalSwitchAccount[]>([]);

  toggleLocalSwitch(event: MouseEvent): void {
    event.stopPropagation();
    this.localSwitchOpen.update((open) => !open);
    if (this.localSwitchOpen() && !this.localAccounts().length) {
      this.localAccountsLoading.set(true);
      this.authService.localAccounts().subscribe({
        next: (data) => { this.localAccounts.set(data.accounts); this.localDistributors.set(data.distributors); this.localAccountsLoading.set(false); },
        error: () => { this.localAccountsError.set('No fue posible cargar las cuentas locales.'); this.localAccountsLoading.set(false); },
      });
    }
  }

  selectLocalAccount(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const userId = select.value;
    select.value = '';
    if (!userId || this.authFacade.isLoading()) return;
    void this.authFacade.switchLocalAccount(userId);
  }
}
