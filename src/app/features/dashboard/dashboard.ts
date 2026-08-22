import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SessionStore } from '../../core/session/session.store';

const ROLE_LABELS: Readonly<Record<string, string>> = {
  general_manager: 'Gerencia general',
  admin: 'Administración',
  branch_manager: 'Gerencia de sucursal',
  coordinator: 'Coordinación',
  verifier: 'Verificación',
  distributor: 'Distribuidora',
  cashier: 'Caja',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styles: [`
    :host { display: block; }
    .dashboard-hero { padding: 1.5rem; border: 1px solid var(--mv-border); border-radius: 1rem; background: linear-gradient(135deg, #fff 0%, #edf6ee 100%); }
    .dashboard-eyebrow { margin: 0; font-size: .72rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    .dashboard-hero h1 { letter-spacing: -.035em; }
    .dashboard-card { min-height: 11rem; }
    .dashboard-card-heading { display: flex; align-items: center; gap: .65rem; }
    .dashboard-card-icon { display: grid; width: 2rem; height: 2rem; place-items: center; border-radius: .65rem; background: var(--mv-primary-100); color: var(--mv-primary-800); font-weight: 800; }
    .dashboard-scope { border: 1px solid var(--mv-border); }
    @media (max-width: 640px) {
      .dashboard-page { padding: .25rem 0 1rem; gap: 1rem; }
      .dashboard-hero { padding: 1.2rem; border-radius: .9rem; }
      .dashboard-hero h1 { font-size: 1.55rem; line-height: 1.15; }
      .dashboard-hero > p:last-child { line-height: 1.5; }
      .dashboard-grid { gap: .85rem; }
      .dashboard-card { min-height: 0; padding: 1rem; border-radius: .9rem; }
      .dashboard-scope { align-items: flex-start; padding: .75rem; }
      .dashboard-scope > span:last-child { max-width: 9rem; text-align: right; line-height: 1.35; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  readonly sessionStore = inject(SessionStore);
  readonly roleLabels = computed(() => this.sessionStore.roles().map((role) => ROLE_LABELS[role] ?? role));
}
