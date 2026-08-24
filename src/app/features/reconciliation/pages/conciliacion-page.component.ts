import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionStore } from '../../../core/session/session.store';
import { MediaApiService } from '../../../core/api/media/media-api.service';
import {
  BankMovement,
  ConciliacionApiService,
  ManualReconciliationRequest,
  PaymentClarification,
} from '../data-access/conciliacion-api.service';
import {
  RelationView,
  RelacionesApiService,
} from '@features/relations/data-access/relaciones-api.service';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';
import { BankReconciliationActionsComponent } from '../components/bank-reconciliation-actions.component';

@Component({
  selector: 'app-conciliacion-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RefactorSelectComponent, BankReconciliationActionsComponent],
  template: `<section class="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div><p class="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Pagos</p>
      <h1 class="text-2xl font-bold text-gray-950">Conciliación bancaria</h1>
      <p class="mt-1 text-sm text-gray-600">
        Consulta cada movimiento, atiende no conciliados y ejecuta únicamente solicitudes
        autorizadas.
      </p></div>
      <button type="button" class="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-600 hover:text-emerald-700" (click)="loadMovements()">Actualizar</button>
    </header>
    @if (error()) {
      <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {{ error() }}
      </div>
    }
    @if (success()) {
      <div
        role="status"
        class="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
      >
        {{ success() }}
      </div>
    }

    @if (canRequest()) {
      <app-bank-reconciliation-actions />
    }

    <section class="space-y-4" aria-labelledby="movements-title">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="movements-title" class="text-lg font-bold">Movimientos importados</h2>
          <p class="text-sm text-gray-500">
            El resultado no modifica la clasificación interna del flujo de Pagos.
          </p>
        </div>
        <div class="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
          <label class="text-xs font-semibold text-gray-600"
            >Buscar<input
              class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal"
              [ngModel]="search()"
              (ngModelChange)="search.set($event)"
              (keyup.enter)="loadMovements()"
              placeholder="Folio, referencia o concepto"
          /></label>
          <label class="text-xs font-semibold text-gray-600"
            >Resultado<refactor-select
              class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal"
              [ngModel]="resultFilter()"
              (ngModelChange)="resultFilter.set($event); loadMovements()"
            >
              <option value="">Todos</option>
              <option value="PARTIAL_PAYMENT">Abono</option>
              <option value="SETTLEMENT">Liquidación</option>
              <option value="SURPLUS">Liquidación + excedente</option>
              <option value="UNRECONCILED">No conciliado</option>
              <option value="DUPLICATE">Duplicado</option>
            </refactor-select></label
          >
          <label class="text-xs font-semibold text-gray-600"
            >Estado<refactor-select
              class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal"
              [ngModel]="statusFilter()"
              (ngModelChange)="statusFilter.set($event); loadMovements()"
            >
              <option value="">Todos</option>
              <option value="RECONCILED">Conciliado</option>
              <option value="UNRECONCILED">No conciliado</option>
              <option value="MANUAL_REQUESTED">Solicitado</option>
              <option value="MANUAL_AUTHORIZED">Autorizado</option>
              <option value="MANUALLY_RECONCILED">Conciliado manual</option>
              <option value="DUPLICATE">Duplicado</option>
            </refactor-select></label
          >
        </div>
      </div>
      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table class="min-w-[1180px] w-full text-left text-sm">
          <thead class="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
            <tr>
              <th class="p-3">Folio bancario</th>
              <th class="p-3">Referencia</th>
              <th class="p-3">Fecha</th>
              <th class="p-3 text-right">Monto</th>
              <th class="p-3">Concepto</th>
              <th class="p-3">Distribuidora</th>
              <th class="p-3">Relación</th>
              <th class="p-3 text-right">Saldo previo</th>
              <th class="p-3">Resultado</th>
              <th class="p-3">Estado</th>
              <th class="p-3">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (item of movements(); track item.id) {
              <tr class="align-top hover:bg-gray-50">
                <td class="p-3 font-medium">{{ item.bank_folio }}</td>
                <td class="p-3 font-mono text-xs">{{ item.payment_reference }}</td>
                <td class="p-3 whitespace-nowrap">{{ item.paid_at | date: 'short' }}</td>
                <td class="p-3 text-right font-semibold">{{ item.amount | currency: 'MXN' }}</td>
                <td class="max-w-56 p-3">{{ item.concept }}</td>
                <td class="p-3">
                  {{ item.distributor_name || 'Sin asignar' }}
                </td>
                <td class="p-3 font-mono text-xs">{{ item.relation_reference || '—' }}</td>
                <td class="p-3 text-right">
                  {{ item.balance_before === null ? '—' : (item.balance_before | currency: 'MXN') }}
                </td>
                <td class="p-3">
                  <span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold">{{
                    item.result
                  }}</span>
                </td>
                <td class="p-3 text-xs font-semibold">
                  {{ statusLabel(item.reconciliation_status) }}
                </td>
                <td class="p-3">
                  @if (canRequest() && item.reconciliation_status === 'UNRECONCILED') {
                    <button
                      class="min-h-11 rounded-lg border border-blue-300 px-3 text-xs font-semibold text-blue-800 hover:bg-blue-50"
                      (click)="startRequest(item)"
                    >
                      Solicitar conciliación
                    </button>
                  }
                  @if (item.manual_request) {
                    <span class="text-xs text-gray-500"
                      >Solicitud {{ item.manual_request.status }}</span
                    >
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="11" class="p-8 text-center text-gray-500">
                  @if (movementLoading()) { Cargando movimientos… } @else {
                    <div class="flex min-h-64 flex-col items-center justify-center">
                      <img src="/no-found-2.png" alt="" class="h-40 w-full max-w-xs object-contain" />
                      <strong class="text-base text-slate-950">No hay movimientos importados</strong>
                      <span class="mt-1 text-sm text-slate-500">Cuando existan movimientos compatibles aparecerán en esta tabla.</span>
                    </div>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    @if (selectedMovement(); as movement) {
      <section
        class="rounded-xl border border-blue-200 bg-blue-50 p-5"
        aria-labelledby="manual-request-title"
      >
        <div class="flex justify-between gap-4">
          <div>
            <h2 id="manual-request-title" class="font-bold text-blue-950">
              Solicitar conciliación de {{ movement.bank_folio }}
            </h2>
            <p class="text-sm text-blue-800">
              Selecciona únicamente la relación respaldada por la aclaración.
            </p>
          </div>
          <button
            class="min-h-11 px-3 text-sm font-semibold text-blue-900"
            (click)="cancelRequest()"
          >
            Cerrar
          </button>
        </div>
        <div class="mt-4 grid gap-4 lg:grid-cols-3">
          <label class="text-sm font-semibold text-blue-950"
            >Relación<refactor-select
              class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal text-gray-900"
              [ngModel]="selectedRelationId()"
              (ngModelChange)="selectRelation($event)"
            >
              <option value="">Selecciona</option>
              @for (relation of relations(); track relation.id) {
                <option [value]="relation.id">
                  {{ relation.payment_reference }} · {{ relation.balance | currency: 'MXN' }}
                </option>
              }
            </refactor-select></label
          >
          <label class="text-sm font-semibold text-blue-950"
            >Aclaración<refactor-select
              class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal text-gray-900"
              [ngModel]="selectedClarificationId()"
              (ngModelChange)="selectedClarificationId.set($event)"
            >
              <option value="">Selecciona</option>
              @for (item of availableClarifications(); track item.id) {
                <option [value]="item.id">{{ item.folio }} · {{ item.reason }}</option>
              }
            </refactor-select></label
          >
          <label class="text-sm font-semibold text-blue-950"
            >Motivo<textarea
              class="mt-1 min-h-24 w-full rounded-lg border border-slate-200 bg-white p-3 font-normal text-gray-900"
              maxlength="1000"
              [ngModel]="requestReason()"
              (ngModelChange)="requestReason.set($event)"
            ></textarea>
          </label>
        </div>
        <button
          class="mt-4 min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
          [disabled]="busy() || !canSubmitRequest()"
          (click)="submitRequest()"
        >
          Enviar a autorización
        </button>
      </section>
    }

    <section class="space-y-3" aria-labelledby="clarifications-title">
      <h2 id="clarifications-title" class="text-lg font-bold">Aclaraciones disponibles</h2>
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        @for (item of clarifications(); track item.id) {
          <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex justify-between gap-3">
              <strong>{{ item.folio }}</strong
              ><span class="text-xs font-bold">{{ item.status }}</span>
            </div>
            <p class="mt-2 text-sm text-gray-700">{{ item.reason }}</p>
            <dl class="mt-3 text-xs text-gray-500">
              <dt>Relación</dt>
              <dd class="font-mono text-gray-800">{{ item.relation_reference }}</dd>
              <dt class="mt-2">Distribuidora</dt>
              <dd class="text-gray-800">Sin dato</dd>
            </dl>
            <button
              class="mt-3 min-h-11 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-gray-800 hover:bg-gray-50"
              (click)="downloadEvidence(item)"
            >
              Ver comprobante
            </button>
          </article>
        }
        @if (!clarifications().length) {
          <p class="text-sm text-gray-500">No hay aclaraciones visibles.</p>
        }
      </div>
    </section>

    <section class="space-y-3" aria-labelledby="requests-title">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="requests-title" class="text-lg font-bold">Solicitudes de conciliación manual</h2>
          <p class="text-sm text-gray-500">
            La autorización y la ejecución quedan registradas por separado.
          </p>
        </div>
        @if (canAuthorize()) {
          <label class="text-xs font-semibold text-gray-600"
            >Motivo de rechazo<input
              class="mt-1 min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal"
              [ngModel]="decisionReason()"
              (ngModelChange)="decisionReason.set($event)"
              placeholder="Obligatorio al rechazar"
          /></label>
        }
      </div>
      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table class="min-w-[850px] w-full text-left text-sm">
          <thead class="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
            <tr>
              <th class="p-3">Folio</th>
              <th class="p-3">Relación</th>
              <th class="p-3">Solicitó</th>
              <th class="p-3">Motivo</th>
              <th class="p-3">Estado</th>
              <th class="p-3">Autorizó</th>
              <th class="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (item of manualRequests(); track item.id) {
              <tr>
                <td class="p-3 font-medium">{{ item.bank_folio }}</td>
                <td class="p-3 font-mono text-xs">{{ item.relation_reference }}</td>
                <td class="p-3">{{ item.requested_by_name || item.requested_by }}</td>
                <td class="max-w-64 p-3">{{ item.reason }}</td>
                <td class="p-3 font-semibold">{{ item.status }}</td>
                <td class="p-3">{{ item.authorized_by_name || '—' }}</td>
                <td class="p-3">
                  <div class="flex flex-wrap gap-2">
                    @if (canAuthorize() && item.status === 'REQUESTED') {
                      <button
                        class="min-h-11 rounded-lg bg-green-700 px-3 text-xs font-semibold text-white"
                        [disabled]="busy()"
                        (click)="decide(item, 'AUTHORIZE')"
                      >
                        Autorizar</button
                      ><button
                        class="min-h-11 rounded-lg border border-red-300 px-3 text-xs font-semibold text-red-800 disabled:opacity-50"
                        [disabled]="busy() || !decisionReason().trim()"
                        (click)="decide(item, 'REJECT')"
                      >
                        Rechazar
                      </button>
                    }
                    @if (canExecute() && item.status === 'AUTHORIZED') {
                      <button
                        class="min-h-11 rounded-lg bg-blue-700 px-3 text-xs font-semibold text-white"
                        [disabled]="busy()"
                        (click)="execute(item)"
                      >
                        Ejecutar conciliación
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
            @if (!manualRequests().length) {
              <tr>
                <td colspan="7" class="p-8 text-center text-gray-500">
                  <div class="flex min-h-56 flex-col items-center justify-center">
                    <img src="/no-found-1.png" alt="" class="h-36 w-full max-w-xs object-contain" />
                    <strong class="text-base text-slate-950">No hay solicitudes visibles</strong>
                    <span class="mt-1 text-sm text-slate-500">Las conciliaciones manuales aparecerán aquí cuando existan.</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  </section>`,
})
export class ConciliacionPageComponent {
  private readonly api = inject(ConciliacionApiService);
  private readonly relationsApi = inject(RelacionesApiService);
  private readonly session = inject(SessionStore);
  private readonly mediaApi = inject(MediaApiService);
  readonly movements = signal<BankMovement[]>([]);
  readonly clarifications = signal<PaymentClarification[]>([]);
  readonly manualRequests = signal<ManualReconciliationRequest[]>([]);
  readonly relations = signal<RelationView[]>([]);
  readonly selectedMovement = signal<BankMovement | null>(null);
  readonly selectedRelationId = signal('');
  readonly selectedClarificationId = signal('');
  readonly requestReason = signal('');
  readonly decisionReason = signal('');
  readonly resultFilter = signal('');
  readonly statusFilter = signal('');
  readonly search = signal('');
  readonly busy = signal(false);
  readonly movementLoading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  constructor() {
    this.refresh();
  }

  loadMovements(): void {
    this.movementLoading.set(true);
    this.api
      .movements({
        result: this.resultFilter(),
        status: this.statusFilter(),
        search: this.search().trim(),
      })
      .subscribe({
        next: (items) => {
          this.movements.set(items);
          this.movementLoading.set(false);
        },
        error: (error) => {
          this.movementLoading.set(false);
          this.showError(error, 'No fue posible consultar los movimientos.');
        },
      });
  }

  startRequest(movement: BankMovement): void {
    this.selectedMovement.set(movement);
    this.selectedRelationId.set('');
    this.selectedClarificationId.set('');
    this.requestReason.set('');
  }
  cancelRequest(): void {
    this.selectedMovement.set(null);
  }
  selectRelation(id: string): void {
    this.selectedRelationId.set(id);
    this.selectedClarificationId.set('');
  }
  availableClarifications(): PaymentClarification[] {
    return this.clarifications().filter(
      (item) => item.relation_id === this.selectedRelationId() && item.status === 'OPEN',
    );
  }
  canSubmitRequest(): boolean {
    return (
      !!this.selectedRelationId() &&
      !!this.selectedClarificationId() &&
      !!this.requestReason().trim()
    );
  }

  submitRequest(): void {
    const movement = this.selectedMovement();
    if (!movement || !this.canSubmitRequest()) return;
    this.busy.set(true);
    this.clearMessages();
    this.api
      .requestManual(
        movement.id,
        this.selectedRelationId(),
        this.selectedClarificationId(),
        this.requestReason().trim(),
      )
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.selectedMovement.set(null);
          this.success.set('La conciliación se envió a autorización.');
          this.refresh();
        },
        error: (error) => {
          this.busy.set(false);
          this.showError(error, 'No fue posible solicitar la conciliación.');
        },
      });
  }

  decide(item: ManualReconciliationRequest, decision: 'AUTHORIZE' | 'REJECT'): void {
    this.clearMessages();
    this.busy.set(true);
    this.api
      .decideManual(
        item.id,
        decision,
        decision === 'REJECT' ? this.decisionReason().trim() : undefined,
      )
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.success.set(
            decision === 'AUTHORIZE' ? 'Conciliación autorizada.' : 'Conciliación rechazada.',
          );
          this.refresh();
        },
        error: (error) => {
          this.busy.set(false);
          this.showError(error, 'No fue posible registrar la decisión.');
        },
      });
  }

  execute(item: ManualReconciliationRequest): void {
    this.clearMessages();
    this.busy.set(true);
    this.api.executeManual(item.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.success.set('La conciliación fue ejecutada y entregada al flujo de Pagos.');
        this.refresh();
      },
      error: (error) => {
        this.busy.set(false);
        this.showError(error, 'No fue posible ejecutar la conciliación.');
      },
    });
  }

  downloadEvidence(item: PaymentClarification): void {
    this.mediaApi.download(item.evidence_media_id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: (error) => this.showError(error, 'No fue posible abrir el comprobante.'),
    });
  }

  canRequest(): boolean {
    return this.session.permissions().includes('manual_reconciliation.request_branch');
  }
  canExecute(): boolean {
    return this.session.permissions().includes('manual_reconciliation.execute_branch');
  }
  canAuthorize(): boolean {
    return this.session
      .permissions()
      .some((permission) =>
        [
          'manual_reconciliation.authorize_branch',
          'manual_reconciliation.authorize_global',
        ].includes(permission),
      );
  }
  statusLabel(value: string): string {
    return (
      (
        {
          RECONCILED: 'Conciliado',
          UNRECONCILED: 'No conciliado',
          DUPLICATE: 'Duplicado',
          MANUAL_REQUESTED: 'En autorización',
          MANUAL_AUTHORIZED: 'Autorizado',
          MANUALLY_RECONCILED: 'Conciliado manual',
          ERROR: 'Error',
        } as Record<string, string>
      )[value] ?? value
    );
  }

  private refresh(): void {
    this.loadMovements();
    this.api.clarifications().subscribe({
      next: (items) => this.clarifications.set(items),
      error: () => this.clarifications.set([]),
    });
    this.api.manualRequests().subscribe({
      next: (items) => this.manualRequests.set(items),
      error: () => this.manualRequests.set([]),
    });
    if (this.canRequest())
      this.relationsApi.list({ per_page: 100 }).subscribe({
        next: (page) => this.relations.set(page.data),
        error: () => this.relations.set([]),
      });
  }

  private clearMessages(): void {
    this.error.set('');
    this.success.set('');
  }
  private showError(response: HttpErrorResponse, fallback: string): void {
    this.error.set(response.error?.error?.message ?? fallback);
  }
}
