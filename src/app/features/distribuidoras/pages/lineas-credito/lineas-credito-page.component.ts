import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin, map, Observable } from 'rxjs';
import { SessionStore } from '../../../../core/session/session.store';
import {
  CreditIncreaseView,
  CreditLineView,
  CreditMovementView,
  CreditoApiService,
} from '../../data-access/api/credito-api.service';

@Component({
  selector: 'app-lineas-credito-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: ` <section class="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
    <header class="border-b border-emerald-100 pb-5">
      <p class="text-xs font-bold uppercase tracking-[.16em] text-emerald-800">
        Distribuidoras · crédito
      </p>
      <h1 class="mt-1 text-3xl font-bold tracking-tight text-slate-950">Líneas de crédito</h1>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        Saldo actual, solicitudes y movimientos. La actividad más reciente aparece primero.
      </p>
    </header>
    @if (loading()) {
      <div class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
        Cargando líneas y seguimiento...
      </div>
    } @else if (error()) {
      <div role="alert" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
        {{ error() }}
      </div>
    } @else if (!lines().length) {
      <div
        class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600"
      >
        No hay líneas de crédito visibles para tu alcance.
      </div>
    } @else {
      @if (confirmation()) {
        <div
          aria-live="polite"
          class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          {{ confirmation() }}
        </div>
      }
      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        @for (line of lines(); track line.id) {
          <button
            type="button"
            (click)="selectLine(line)"
            class="grid min-h-28 w-full gap-4 border-b border-slate-100 p-4 text-left transition last:border-b-0 hover:bg-emerald-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700 sm:grid-cols-[minmax(12rem,1fr)_repeat(3,minmax(0,.7fr))_minmax(9rem,.7fr)] sm:items-center"
            [class.bg-emerald-50]="selectedLine()?.id === line.id"
          >
            <div>
              <div>
                <h2 class="mt-1 font-semibold text-slate-950">{{ line.distributor.full_name }}</h2>
              </div>
            </div>
            <div>
              <p class="text-xs text-slate-500">Autorizado</p>
              <p class="mt-1 font-semibold tabular-nums">
                {{ line.total_authorized | currency: 'MXN' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-slate-500">En uso</p>
              <p class="mt-1 font-semibold tabular-nums">
                {{ line.used_balance | currency: 'MXN' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-slate-500">Disponible</p>
              <p class="mt-1 font-semibold tabular-nums text-emerald-800">
                {{ line.available_balance | currency: 'MXN' }}
              </p>
            </div>
            <div class="sm:text-right">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-bold"
                [class]="restrictionClass(line)"
                >{{ restrictionLabel(line) }}</span
              >
              <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full bg-emerald-600"
                  [style.width.%]="usedPercent(line)"
                ></div>
              </div>
              <p class="mt-1 text-xs text-slate-500">{{ usedPercent(line) }}% en uso</p>
            </div>
          </button>
        }
      </div>
      @if (selectedLine(); as line) {
        <section class="border-y border-slate-200 bg-white">
          <div class="border-b border-slate-100 p-5 sm:p-6">
            <div class="flex flex-wrap justify-between gap-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-[.14em] text-emerald-800">
                  Seguimiento de línea
                </p>
                <h2 class="mt-1 text-xl font-bold text-slate-950">
                  {{ line.distributor.full_name }}
                </h2>
                <p class="mt-1 text-sm text-slate-600">Eventos de más reciente a más antiguo.</p>
              </div>
              <p class="max-w-sm text-sm leading-6 text-slate-600">
                {{ restrictionExplanation(line) }}
              </p>
            </div>
          </div>
          @if (latestRequest(); as latest) {
            <div class="border-b border-slate-100 px-5 py-4 sm:px-6">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm font-semibold text-slate-900">
                  Proceso de la solicitud más reciente
                </p>
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-bold"
                  [class]="statusClass(latest.status)"
                  >{{ statusLabel(latest.status) }}</span
                >
              </div>
              <ol class="mt-4 grid grid-cols-3 gap-2 text-xs font-medium text-slate-600">
                <li [class.text-emerald-800]="requestStage(latest.status) >= 1">
                  <span
                    class="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100"
                    [class.bg-emerald-700]="requestStage(latest.status) >= 1"
                    [class.text-white]="requestStage(latest.status) >= 1"
                    >1</span
                  >Solicitud
                </li>
                <li [class.text-emerald-800]="requestStage(latest.status) >= 2">
                  <span
                    class="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100"
                    [class.bg-emerald-700]="requestStage(latest.status) >= 2"
                    [class.text-white]="requestStage(latest.status) >= 2"
                    >2</span
                  >Revisión
                </li>
                <li [class.text-emerald-800]="requestStage(latest.status) >= 3">
                  <span
                    class="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100"
                    [class.bg-emerald-700]="requestStage(latest.status) >= 3"
                    [class.text-white]="requestStage(latest.status) >= 3"
                    >3</span
                  >Decisión
                </li>
              </ol>
              <p class="mt-3 text-sm text-slate-600">{{ nextStepText(latest) }}</p>
            </div>
          }
          @if (line.capabilities?.can_request_increase) {
            <form
              class="border-b border-slate-100 bg-emerald-50/60 p-5 sm:p-6"
              (ngSubmit)="requestIncrease(line)"
            >
              <h3 class="font-bold text-slate-950">Solicitar incremento</h3>
              <p class="mt-1 text-sm text-slate-600">
                La solicitud quedará registrada y podrás seguir cada decisión en el historial.
              </p>
              <div class="mt-4 grid gap-3 md:grid-cols-[.7fr_1.4fr_auto]">
                <label class="text-sm font-medium"
                  >Importe<input
                    class="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5"
                    name="amount-{{ line.id }}"
                    [(ngModel)]="requestedAmount"
                    inputmode="decimal"
                    pattern="[0-9]+(.[0-9]{1,4})?"
                    required /></label
                ><label class="text-sm font-medium"
                  >Motivo<input
                    class="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5"
                    name="reason-{{ line.id }}"
                    [(ngModel)]="requestReason"
                    maxlength="255"
                    required /></label
                ><button
                  class="self-end rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  [disabled]="saving()"
                >
                  Registrar solicitud
                </button>
              </div>
            </form>
          }
          <div class="grid gap-8 p-5 sm:p-6 lg:grid-cols-[1fr_.8fr]">
            <div>
              <h3 class="text-base font-bold text-slate-950">Historial de solicitudes</h3>
              <p class="mt-1 text-sm text-slate-600">
                Qué se solicitó, quién decidió y cuál fue el resultado.
              </p>
              @if (lineRequests().length) {
                <ol class="mt-5 space-y-4 border-l-2 border-slate-200 pl-5">
                  @for (request of lineRequests(); track request.id) {
                    <li class="relative">
                      <span
                        class="absolute -left-[1.82rem] top-1 h-3 w-3 rounded-full border-2 border-white"
                        [class]="statusDot(request.status)"
                      ></span>
                      <div class="rounded-xl border border-slate-200 p-4">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                          <p class="font-bold text-slate-950">
                            Solicitud del {{ request.requested_at | date: 'longDate' }}
                          </p>
                          <span
                            class="rounded-full px-2.5 py-1 text-xs font-bold"
                            [class]="statusClass(request.status)"
                            >{{ statusLabel(request.status) }}</span
                          >
                        </div>
                        <p class="mt-2 text-sm text-slate-700">{{ requestNarrative(request) }}</p>
                        <dl class="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                          <div>
                            <dt class="font-semibold text-slate-800">Solicitado</dt>
                            <dd>
                              {{ request.requested_amount | currency: 'MXN' }} ·
                              {{ request.requested_at | date: 'medium' }}
                            </dd>
                          </div>
                          @if (request.recommended_amount) {
                            <div>
                              <dt class="font-semibold text-slate-800">Recomendado</dt>
                              <dd>{{ request.recommended_amount | currency: 'MXN' }}</dd>
                            </div>
                          }
                          @if (request.authorized_amount) {
                            <div>
                              <dt class="font-semibold text-slate-800">Autorizado</dt>
                              <dd>{{ request.authorized_amount | currency: 'MXN' }}</dd>
                            </div>
                          }
                        </dl>
                      </div>
                    </li>
                  }
                </ol>
              } @else {
                <p class="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  Aún no hay solicitudes registradas para esta línea.
                </p>
              }
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-950">Movimientos de saldo</h3>
              <p class="mt-1 text-sm text-slate-600">Cada cambio confirmado en la línea.</p>
              @if (activityLoading()) {
                <p class="mt-5 text-sm text-slate-500">Cargando movimientos...</p>
              } @else if (movements().length) {
                <ol class="mt-5 space-y-3">
                  @for (movement of movements(); track movement.id) {
                    <li class="rounded-xl bg-slate-50 p-4">
                      <div class="flex justify-between gap-3">
                        <p class="font-semibold text-slate-950">
                          {{ movementLabel(movement.type) }}
                        </p>
                        <p class="font-bold text-emerald-800">
                          {{ movement.amount | currency: 'MXN' }}
                        </p>
                      </div>
                      <p class="mt-1 text-xs text-slate-600">
                        Disponible: {{ movement.available_balance_before | currency: 'MXN' }} →
                        {{ movement.available_balance_after | currency: 'MXN' }}
                      </p>
                      <p class="mt-2 text-xs text-slate-500">
                        {{ movement.occurred_at | date: 'medium' }}
                        @if (movement.performed_by?.name) {
                          · {{ movement.performed_by?.name }}
                        }
                      </p>
                    </li>
                  }
                </ol>
              } @else {
                <p class="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  Todavía no hay movimientos confirmados.
                </p>
              }
            </div>
          </div>
        </section>
      }
    }
  </section>`,
})
export class LineasCreditoPageComponent implements OnInit {
  private readonly api = inject(CreditoApiService);
  private readonly session = inject(SessionStore);
  readonly lines = signal<CreditLineView[]>([]);
  readonly requests = signal<CreditIncreaseView[]>([]);
  readonly movements = signal<CreditMovementView[]>([]);
  readonly selectedLine = signal<CreditLineView | null>(null);
  readonly loading = signal(true);
  readonly activityLoading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly confirmation = signal('');
  requestedAmount = '';
  requestReason = '';
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    const lines: Observable<CreditLineView[]> = this.session.roles().includes('distributor')
      ? this.api.consultarMiLinea().pipe(map((line) => [line]))
      : this.api.listarLineas();
    forkJoin({ lines, requests: this.api.listarIncrementos() }).subscribe({
      next: ({ lines, requests }) => {
        this.lines.set(lines);
        this.requests.set(requests.data);
        this.loading.set(false);
        if (lines.length)
          this.selectLine(lines.find((line) => line.id === this.selectedLine()?.id) ?? lines[0]);
      },
      error: () => {
        this.error.set('No fue posible cargar las líneas de crédito.');
        this.loading.set(false);
      },
    });
  }
  selectLine(line: CreditLineView): void {
    this.selectedLine.set(line);
    if (!line.capabilities?.can_view_movements) {
      this.movements.set([]);
      this.activityLoading.set(false);
      return;
    }
    this.activityLoading.set(true);
    this.api
      .listarMovimientos(line.distributor.id)
      .pipe(finalize(() => this.activityLoading.set(false)))
      .subscribe({
        next: (value) => this.movements.set(value),
        error: () => this.movements.set([]),
      });
  }
  usedPercent(line: CreditLineView): number {
    const total = Number(line.total_authorized);
    return total > 0
      ? Math.min(100, Number(((Number(line.used_balance) / total) * 100).toFixed(1)))
      : 0;
  }
  lineRequests(): CreditIncreaseView[] {
    const id = this.selectedLine()?.distributor.id;
    return this.requests()
      .filter((request) => request.distributor?.id === id)
      .sort((a, b) => (b.requested_at ?? '').localeCompare(a.requested_at ?? ''));
  }
  latestRequest(): CreditIncreaseView | null {
    return this.lineRequests()[0] ?? null;
  }
  requestStage(status: string): number {
    if (status === 'REQUESTED' || status === 'REJECTED_BY_COORDINATOR') return 1;
    if (status === 'PREAUTHORIZED') return 2;
    return 3;
  }
  nextStepText(request: CreditIncreaseView): string {
    if (request.status === 'REQUESTED')
      return 'Siguiente paso: coordinación revisará la solicitud.';
    if (request.status === 'PREAUTHORIZED')
      return 'Siguiente paso: gerencia tomará la decisión final.';
    if (request.status.startsWith('REJECTED'))
      return 'El proceso terminó sin modificar la línea. El motivo aparece en el historial.';
    return 'El proceso terminó y el importe autorizado ya forma parte de la línea.';
  }
  requestIncrease(line: CreditLineView): void {
    if (!this.requestedAmount || !this.requestReason.trim() || this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    this.api
      .solicitarIncremento(
        line.distributor.id,
        this.requestedAmount,
        this.requestReason.trim(),
        line.lock_version,
      )
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.requestedAmount = '';
          this.requestReason = '';
          this.confirmation.set(
            'Solicitud registrada. Ahora puedes seguir su revisión y decisión aquí mismo.',
          );
          this.load();
        },
        error: () =>
          this.error.set(
            'No fue posible registrar la solicitud. Verifica el importe y el estado de la línea.',
          ),
      });
  }
  restrictionLabel(line: CreditLineView): string {
    return line.restriction ? 'Uso con validación' : 'Disponible para usar';
  }
  restrictionExplanation(line: CreditLineView): string {
    return line.restriction
      ? 'El siguiente vale debe respetar el importe autorizado para continuar usando la línea.'
      : 'No hay condiciones adicionales para usar el saldo.';
  }
  restrictionClass(line: CreditLineView): string {
    return line.restriction ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-900';
  }
  lastMovementText(line: CreditLineView): string {
    return line.last_movement
      ? `${this.movementLabel(line.last_movement.type)} · ${new Date(line.last_movement.occurred_at).toLocaleDateString('es-MX')}`
      : 'Sin movimientos registrados';
  }
  statusLabel(status: string): string {
    return (
      (
        {
          REQUESTED: 'Pendiente de coordinación',
          PREAUTHORIZED: 'Pendiente de gerencia',
          AUTHORIZED_TOTAL: 'Autorizado',
          AUTHORIZED_PARTIAL: 'Autorizado parcialmente',
          REJECTED_BY_COORDINATOR: 'Rechazado por coordinación',
          REJECTED_BY_MANAGER: 'Rechazado por gerencia',
          COMPLETED: 'Completado',
        } as Record<string, string>
      )[status] ?? 'Estado actualizado'
    );
  }
  statusClass(status: string): string {
    if (status.startsWith('AUTHORIZED') || status === 'COMPLETED')
      return 'bg-emerald-100 text-emerald-900';
    if (status.startsWith('REJECTED')) return 'bg-red-100 text-red-800';
    if (status === 'PREAUTHORIZED') return 'bg-amber-100 text-amber-900';
    return 'bg-sky-100 text-sky-900';
  }
  statusDot(status: string): string {
    return this.statusClass(status).split(' ')[0];
  }
  requestNarrative(request: CreditIncreaseView): string {
    if (request.status === 'REQUESTED')
      return 'La distribuidora solicitó un incremento. Falta la revisión de coordinación.';
    if (request.status === 'PREAUTHORIZED')
      return `Coordinación recomendó ${this.money(request.recommended_amount)}. Falta la decisión de gerencia.`;
    if (request.status.startsWith('AUTHORIZED'))
      return `Gerencia autorizó ${this.money(request.authorized_amount)} y la línea se actualizó.`;
    if (request.status.startsWith('REJECTED'))
      return request.manager_reason || request.coordinator_reason || 'La solicitud fue rechazada.';
    return 'La solicitud cambió de estado.';
  }
  movementLabel(type: string): string {
    return (
      (
        {
          INITIAL_AUTHORIZATION: 'Línea inicial autorizada',
          INCREASE: 'Incremento autorizado',
          VOUCHER_CASHED: 'Capital aplicado a vale',
          PAYMENT_RECOVERY: 'Capital recuperado por pago',
        } as Record<string, string>
      )[type] ?? 'Movimiento de línea'
    );
  }
  private money(amount: string | null | undefined): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
      Number(amount ?? 0),
    );
  }
}
