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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  readonly sessionStore = inject(SessionStore);
  readonly roleLabels = computed(() => this.sessionStore.roles().map((role) => ROLE_LABELS[role] ?? role));
}
