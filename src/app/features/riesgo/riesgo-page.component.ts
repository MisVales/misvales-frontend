import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionStore } from '../../core/session/session.store';
import { DelinquencyStatus, Removal, RiesgoApiService, RiskAlert, RelationDetail } from './riesgo-api.service';
import { RelationDetailsDialogComponent } from './relation-details-dialog.component';

@Component({
  selector: 'app-riesgo-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RelationDetailsDialogComponent],
  template: `
    <section class="space-y-6 p-6">
      <header>
        <h1 class="text-2xl font-bold">Riesgo y morosidad</h1>
        <p class="text-sm text-gray-600">
          La morosidad aplica únicamente a la distribuidora. Tres incumplimientos generan alerta, no
          bloqueo automático.
        </p>
      </header>

      @if (status(); as ownStatus) {
        <aside
          class="rounded-xl border p-4"
          [class.border-red-300]="ownStatus.blocked"
          [class.bg-red-50]="ownStatus.blocked"
        >
          <strong>
            {{
              ownStatus.blocked
                ? 'Generación de vales bloqueada por morosidad'
                : 'Sin bloqueo vigente por morosidad'
            }}
          </strong>
          @if (ownStatus.reason) {
            <p class="mt-1 text-sm">Motivo: {{ ownStatus.reason }}</p>
          }
          <p class="mt-1 text-sm">
            Los pagos y las aclaraciones permanecen disponibles durante el bloqueo.
          </p>
        </aside>
      }

      @if (canViewAlerts()) {
        <section>
          <h2 class="font-bold">Alertas</h2>
          @for (alert of alerts(); track alert.id) {
            <article class="mt-3 rounded-xl border bg-white p-4">
              <div class="flex justify-between">
                <strong>{{ alert.consecutive_defaults }} relaciones consecutivas</strong>
                <span>{{ alert.status }}</span>
              </div>
              <p class="text-sm font-semibold">
                Saldo vencido {{ alert.overdue_balance | currency: 'MXN' }}
              </p>
              
              <div class="mt-2 mb-4">
                <button
                  class="text-sm font-semibold text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                  (click)="viewDetails(alert)"
                >
                  Ver detalle de cortes ({{ alert.relation_details?.length || alert.relation_ids.length }})
                </button>
              </div>

              @if (canDecide() && alert.status === 'OPEN') {
                <textarea
                  class="my-2 w-full rounded-lg border p-2"
                  [class.border-red-600]="showReasonError && !reason"
                  [(ngModel)]="reason"
                  placeholder="Evidencia y motivo"
                ></textarea>
                @if (showReasonError && !reason) {
                  <p class="text-xs font-semibold text-red-600 mb-2">El motivo es obligatorio para registrar tu decisión.</p>
                }
                <button
                  class="mr-2 rounded-lg bg-red-700 px-3 py-2 text-white"
                  (click)="decide(alert, 'APPLY')"
                >
                  Aplicar morosidad
                </button>
                <button class="rounded-lg border px-3 py-2" (click)="decide(alert, 'DO_NOT_APPLY')">
                  No aplicar
                </button>
              }
              @if (canRequestRemoval()) {
                <button class="mt-3 rounded-lg border px-3 py-2" (click)="requestRemoval(alert)">
                  Preparar retiro tras regularización
                </button>
              }
            </article>
          }
        </section>
      }

      @if (canDecideRemoval()) {
        <section>
          <h2 class="font-bold">Retiros solicitados</h2>
          @for (removal of removals(); track removal.id) {
            <article class="mt-3 rounded-xl border bg-white p-4">
              <strong>{{ removal.status }}</strong>
              <p>{{ removal.reason }}</p>
              @if (removal.status === 'REQUESTED') {
                <input
                  class="my-2 w-full rounded-lg border p-2"
                  [class.border-red-600]="showReasonError && !reason"
                  [(ngModel)]="reason"
                  placeholder="Motivo"
                />
                @if (showReasonError && !reason) {
                  <p class="text-xs font-semibold text-red-600 mb-2">El motivo es obligatorio para registrar tu decisión.</p>
                }
                <button class="mr-2 rounded-lg border px-3 py-2" (click)="decideRemoval(removal, 'AUTHORIZE')">
                  Autorizar retiro
                </button>
                <button class="rounded-lg border px-3 py-2" (click)="decideRemoval(removal, 'REJECT')">Rechazar</button>
              }
            </article>
          }
        </section>
      }
    </section>

    <app-relation-details-dialog
      [open]="dialogOpen()"
      [relations]="selectedRelations()"
      (close)="closeDialog()"
    ></app-relation-details-dialog>
  `,
})
export class RiesgoPageComponent {
  private readonly api = inject(RiesgoApiService);
  private readonly session = inject(SessionStore);

  readonly alerts = signal<RiskAlert[]>([]);
  readonly removals = signal<Removal[]>([]);
  readonly status = signal<DelinquencyStatus | null>(null);

  readonly dialogOpen = signal(false);
  readonly selectedRelations = signal<RelationDetail[]>([]);

  reason = '';
  showReasonError = false;

  constructor() {
    this.load();
  }

  canViewAlerts(): boolean {
    return this.session
      .permissions()
      .some((permission) =>
        ['risk.view_assigned', 'risk.view_branch', 'risk.view_global'].includes(permission),
      );
  }

  canDecide(): boolean {
    return this.session
      .permissions()
      .some((permission) =>
        ['delinquency.decide_branch', 'delinquency.decide_global'].includes(permission),
      );
  }

  canRequestRemoval(): boolean {
    return this.session.permissions().includes('delinquency_removal.request_assigned');
  }

  canDecideRemoval(): boolean {
    return this.session
      .permissions()
      .some((permission) =>
        ['delinquency_removal.decide_branch', 'delinquency_removal.decide_global'].includes(
          permission,
        ),
      );
  }

  decide(alert: RiskAlert, decision: 'APPLY' | 'DO_NOT_APPLY'): void {
    if (!this.reason) {
      this.showReasonError = true;
      return;
    }
    this.showReasonError = false;
    this.api.decide(alert.id, decision, this.reason).subscribe(() => {
      this.reason = '';
      this.load();
    });
  }

  requestRemoval(alert: RiskAlert): void {
    if (!this.reason) {
      this.showReasonError = true;
      return;
    }
    this.showReasonError = false;
    this.api.requestRemoval(alert.distributor_id, this.reason).subscribe(() => {
      this.reason = '';
      this.load();
    });
  }

  decideRemoval(removal: Removal, decision: 'AUTHORIZE' | 'REJECT'): void {
    if (!this.reason) {
      this.showReasonError = true;
      return;
    }
    this.showReasonError = false;
    this.api.decideRemoval(removal.id, decision, this.reason).subscribe(() => {
      this.reason = '';
      this.load();
    });
  }

  private load(): void {
    if (
      this.session.roles().includes('distributor') &&
      this.session.permissions().includes('risk.view_own')
    ) {
      this.api.me().subscribe((status) => this.status.set(status));
    }
    if (this.canViewAlerts()) {
      this.api.alerts().subscribe((alerts) => this.alerts.set(alerts));
    }
    if (this.canDecideRemoval()) {
      this.api.removals().subscribe((removals) => this.removals.set(removals));
    }
  }

  viewDetails(alert: RiskAlert): void {
    if (alert.relation_details && alert.relation_details.length > 0) {
      this.selectedRelations.set(alert.relation_details);
      this.dialogOpen.set(true);
    }
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }
}
