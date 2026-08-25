import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MediaApiService } from '../../core/api/media/media-api.service';
import { AttachmentPreviewComponent } from '../../shared/components/media/attachment-preview/attachment-preview.component';
import { SessionStore } from '../../core/session/session.store';
import {
  ExcedentesApiService,
  RefundRequest,
} from '@features/payments/data-access/excedentes-api.service';
import { ReportsApiService } from '@features/reports/data-access/reports-api.service';
import {
  CentroOperacionApiService,
  ForcePaymentDeadlineResponse,
  NotificationItem,
  OperationalLog,
} from './centro-operacion-api.service';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';
import { PaymentCyclePanelComponent } from './components/payment-cycle-panel/payment-cycle-panel.component';

@Component({
  selector: 'app-centro-operacion-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AttachmentPreviewComponent,
    RefactorSelectComponent,
    PaymentCyclePanelComponent,
  ],
  template: ` <section class="space-y-6 p-4 md:p-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Centro de operación</h1>
        <p class="text-sm text-gray-600">
          Notificaciones, reportes, auditoría y logs correlacionados.
        </p>
      </div>
      @if (canNotify()) {
        <div
          class="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-700 px-3 py-2 text-sm font-semibold text-white"
          aria-label="Notificaciones no leídas"
        >
          <lucide-icon name="bell" class="h-4 w-4" aria-hidden="true"></lucide-icon>
          {{ unreadCount() }}
        </div>
      }
    </header>
    @if (isGerenteGeneral()) {
      <app-payment-cycle-panel />
    }
    @if (canNotify()) {
      <section>
        <div class="flex items-center gap-3">
          <h2 class="font-bold">Notificaciones</h2>
          <label class="text-sm"
            ><input type="checkbox" [(ngModel)]="unreadOnly" (change)="loadNotifications()" /> Solo
            no leídas</label
          >
        </div>
        <div class="mt-3 grid gap-2">
          @for (item of notifications(); track item.id) {
            <article class="rounded-xl border bg-white p-4" [class.opacity-60]="item.read_at">
              <div class="flex justify-between gap-2">
                <strong>{{ item.data.title }}</strong
                ><small>{{ item.created_at | date: 'short' }}</small>
              </div>
              <p>{{ item.data.description }}</p>
              <div class="mt-2 flex gap-2">
                <button class="rounded border px-3 py-1" (click)="open(item)">Abrir recurso</button>
                @if (!item.read_at) {
                  <button class="rounded border px-3 py-1" (click)="mark(item)">
                    Marcar leída
                  </button>
                }
              </div>
            </article>
          } @empty {
            <p class="rounded border border-dashed p-4 text-gray-500">Sin notificaciones.</p>
          }
        </div>
      </section>
    }
    @if (canReports()) {
      <section class="space-y-4 mb-8">
        <h2 class="font-bold">Reportes Excel Especiales</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border bg-white p-4">
            <h3 class="mb-3 font-bold text-gray-700">Saldo de puntos por distribuidora al corte</h3>
            <div class="flex flex-col gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <label class="text-sm text-gray-600 font-semibold">Día del corte:</label>
                <input
                  class="rounded border p-2 text-sm"
                  type="date"
                  [(ngModel)]="puntosCorteAt"
                  aria-label="Fecha del Corte"
                />
              </div>
              <button
                class="w-fit mt-2 rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50"
                (click)="descargarPuntos()"
                [disabled]="isExportingPuntos"
              >
                {{ isExportingPuntos ? 'Exportando...' : 'Exportar Excel' }}
              </button>
            </div>
          </div>
          <div class="rounded-xl border bg-white p-4">
            <h3 class="mb-3 font-bold text-gray-700">Presolicitudes pendientes y validadas</h3>
            <div class="flex flex-col gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <label class="text-sm text-gray-600 font-semibold">Estado:</label>
                <refactor-select class="rounded border p-2 text-sm" [(ngModel)]="presolStatus">
                  <option value="TODOS">Todos</option>
                  <option value="PENDIENTES">Pendientes</option>
                  <option value="VALIDADAS">Validadas</option>
                </refactor-select>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <label class="text-sm text-gray-600 font-semibold">Desde:</label>
                <input
                  class="rounded border p-2 text-sm"
                  type="date"
                  [(ngModel)]="presolFrom"
                  aria-label="Desde"
                />
                <label class="text-sm text-gray-600 font-semibold">Hasta:</label>
                <input
                  class="rounded border p-2 text-sm"
                  type="date"
                  [(ngModel)]="presolTo"
                  aria-label="Hasta"
                />
              </div>
              <button
                class="w-fit mt-1 rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50"
                (click)="descargarPresolicitudes()"
                [disabled]="isExportingPresol"
              >
                {{ isExportingPresol ? 'Exportando...' : 'Exportar Excel' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="font-bold">Reportes funcionales</h2>
        <div class="grid gap-2 md:grid-cols-5">
          <refactor-select class="rounded border p-2" [(ngModel)]="selectedReport">
            <option value="">Seleccione reporte</option>
            @for (report of reports(); track report) {
              <option [value]="report">{{ report }}</option>
            }</refactor-select
          ><input
            class="rounded border p-2"
            type="date"
            [(ngModel)]="dateFrom"
            aria-label="Desde"
          /><input
            class="rounded border p-2"
            type="date"
            [(ngModel)]="dateTo"
            aria-label="Hasta"
          /><input class="rounded border p-2" [(ngModel)]="status" placeholder="Estado" /><button
            class="rounded bg-indigo-700 px-3 py-2 text-white"
            (click)="runReport()"
          >
            Consultar
          </button>
        </div>
        <div class="overflow-x-auto rounded-xl border bg-white">
          <table class="min-w-full text-left text-xs">
            <tbody>
              @for (row of reportRows(); track $index) {
                <tr class="border-b">
                  <td class="p-3">
                    <pre class="whitespace-pre-wrap">{{ row | json }}</pre>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td class="p-4 text-gray-500">Sin datos consultados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    }
    @if (false && isGerenteGeneral()) {
      <section class="space-y-3">
        <div>
          <h2 class="font-bold">Simulación del ciclo de pago</h2>
          <p class="mt-1 text-sm text-gray-600">
            Ejecuta el corte configurado y después evalúa su fecha límite sin cambiar el reloj del
            sistema.
          </p>
        </div>
        <div class="grid gap-4 lg:grid-cols-2">
          @if (cutoffSummary(); as summary) {
            <article class="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-bold uppercase tracking-wide text-blue-700">Paso 1</p>
                  <h3 class="mt-1 font-bold text-gray-900">Corte de relaciones</h3>
                </div>
                <span
                  class="rounded-full px-3 py-1 text-xs font-bold"
                  [class.bg-green-100]="cutoffState() === 'CLOSED'"
                  [class.text-green-800]="cutoffState() === 'CLOSED'"
                  [class.bg-blue-100]="cutoffState() === 'OPEN'"
                  [class.text-blue-800]="cutoffState() === 'OPEN'"
                  [class.bg-yellow-100]="cutoffState() === 'PROCESANDO'"
                  [class.text-yellow-800]="cutoffState() === 'PROCESANDO'"
                >
                  {{
                    cutoffState() === 'PROCESANDO'
                      ? 'Procesando'
                      : cutoffState() === 'CLOSED'
                        ? 'Generado'
                        : 'Listo'
                  }}
                </span>
              </div>
              <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt class="text-gray-500">Corte simulado</dt>
                  <dd class="font-semibold">
                    {{
                      summary.payment_period?.cutoff_at || summary.period.projected_end
                        | date: 'medium'
                    }}
                  </dd>
                </div>
                <div>
                  <dt class="text-gray-500">Parcialidades</dt>
                  <dd class="font-semibold">
                    {{ summary.payment_period?.summary?.operations ?? summary.summary.operations }}
                    de
                    {{
                      summary.payment_period?.summary?.distributors ?? summary.summary.distributors
                    }}
                    distribuidoras
                  </dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-gray-500">Total proyectado</dt>
                  <dd class="font-semibold">
                    {{
                      summary.payment_period?.summary?.total ?? summary.summary.total
                        | currency: 'MXN'
                    }}
                  </dd>
                </div>
              </dl>
              @if (cutoffGenerated()) {
                <p class="mt-4 rounded-lg bg-green-50 p-3 text-xs text-green-800">
                  Relaciones y referencias generadas correctamente.
                </p>
              }
              @if (cutoffError()) {
                <p class="mt-3 font-semibold text-red-700" role="alert">{{ cutoffError() }}</p>
              }
              @if (cutoffState() === 'OPEN' && summary.has_open_cutoff) {
                <button
                  class="mt-4 min-h-11 rounded-lg bg-blue-700 px-4 py-2 font-bold text-white shadow-sm hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                  (click)="openForceCutoffModal()"
                >
                  Forzar fecha de corte
                </button>
              }
            </article>

            <article
              class="rounded-xl border border-amber-200 bg-white p-5 shadow-sm"
              [class.opacity-60]="!summary.payment_period"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-bold uppercase tracking-wide text-amber-700">Paso 2</p>
                  <h3 class="mt-1 font-bold text-gray-900">Fecha límite de pago</h3>
                </div>
                <span
                  class="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800"
                  >{{
                    deadlineState() === 'COMPLETED'
                      ? 'Evaluada'
                      : deadlineState() === 'EXPIRED'
                        ? 'Corte vencido'
                        : deadlineState() === 'DEADLINE_REACHED'
                          ? 'Fecha límite alcanzada'
                          : deadlineState() === 'PROCESSING'
                            ? 'Procesando'
                            : 'Pendiente'
                  }}</span
                >
              </div>
              @if (summary.payment_period; as period) {
                <p class="mt-4 text-sm text-gray-600">
                  Simula llegar exactamente al cierre configurado y evalúa los pagos conciliados
                  acumulados.
                </p>
                <p class="mt-3 text-lg font-bold text-gray-900">
                  {{ period.payment_deadline_at | date: 'fullDate' }} ·
                  {{ period.payment_deadline_at | date: 'mediumTime' }}
                </p>
                @if (deadlineState() === 'DEADLINE_REACHED' && period.overdue_evaluation_at) {
                  <div
                    class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900"
                  >
                    <p class="font-bold">Siguiente paso: evaluar atrasos</p>
                    <p class="mt-1">
                      {{ period.overdue_evaluation_at | date: 'fullDate' }} ·
                      {{ period.overdue_evaluation_at | date: 'mediumTime' }}
                    </p>
                    <p class="mt-1">
                      Hasta entonces los pagos siguen siendo puntuales y ninguna relación se marca
                      atrasada.
                    </p>
                  </div>
                }
                @if (deadlineResult(); as result) {
                  @if (result.status === 'DEFERRED') {
                    <div
                      class="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
                      role="alert"
                    >
                      {{ result.message }}
                    </div>
                  } @else if (result.outcomes; as outcomes) {
                    <dl class="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                      <div class="rounded-lg bg-green-50 p-2">
                        <dt class="text-green-700">Liquidadas</dt>
                        <dd class="text-xl font-bold text-green-900">{{ outcomes.settled }}</dd>
                      </div>
                      <div class="rounded-lg bg-amber-50 p-2">
                        <dt class="text-amber-700">Con saldo</dt>
                        <dd class="text-xl font-bold text-amber-900">
                          {{ outcomes.partially_paid }}
                        </dd>
                      </div>
                      <div class="rounded-lg bg-red-50 p-2">
                        <dt class="text-red-700">Sin pago</dt>
                        <dd class="text-xl font-bold text-red-900">{{ outcomes.unpaid }}</dd>
                      </div>
                    </dl>
                  }
                }
                @if (deadlineError()) {
                  <p class="mt-3 font-semibold text-red-700" role="alert">{{ deadlineError() }}</p>
                }
                @if (
                  deadlineState() === 'IDLE' ||
                  deadlineState() === 'DEADLINE_REACHED' ||
                  deadlineState() === 'DEFERRED'
                ) {
                  <button
                    class="mt-4 min-h-11 rounded-lg bg-amber-700 px-4 py-2 font-bold text-white shadow-sm hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-50"
                    (click)="openForceDeadlineModal()"
                    [disabled]="deadlineState() === 'PROCESSING'"
                  >
                    {{
                      deadlineState() === 'DEADLINE_REACHED'
                        ? 'Vencer fecha límite de pago'
                        : 'Forzar fecha límite de pago'
                    }}
                  </button>
                }
              } @else {
                <p class="mt-4 text-sm text-gray-500">
                  Primero genera el corte para congelar referencias, periodo anticipado y fecha
                  límite.
                </p>
              }
            </article>
          } @else {
            <p class="rounded-xl border bg-white p-4 text-sm text-gray-500 lg:col-span-2">
              Cargando información del ciclo...
            </p>
          }
        </div>
      </section>

      @if (showForceCutoffModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cutoff-modal-title"
          >
            <h3 id="cutoff-modal-title" class="text-lg font-bold text-gray-900">
              Forzar corte configurado
            </h3>
            <div class="mt-4 text-sm text-gray-700 space-y-3">
              <p>
                Se simulará la fecha de corte mostrada y se tomarán todas las parcialidades
                exigibles hasta ese instante.
              </p>
              <p>
                Se generarán relaciones, referencias, periodo anticipado y fecha límite con la
                configuración publicada.
              </p>
              <div>
                <label for="cutoff-reason" class="block font-semibold mb-1"
                  >Motivo del cierre manual (opcional)</label
                >
                <input
                  id="cutoff-reason"
                  class="min-h-11 w-full rounded border p-2 text-base"
                  [(ngModel)]="cutoffMotivo"
                  placeholder="Ej. Cierre solicitado por Gerencia"
                />
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <button
                class="min-h-11 rounded px-4 py-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600"
                (click)="closeForceCutoffModal()"
                [disabled]="cutoffState() === 'PROCESANDO'"
              >
                Cancelar
              </button>
              <button
                class="min-h-11 rounded bg-blue-700 px-4 py-2 font-bold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:opacity-50"
                (click)="executeForceCutoff()"
                [disabled]="cutoffState() === 'PROCESANDO'"
              >
                {{ cutoffState() === 'PROCESANDO' ? 'Procesando...' : 'Confirmar y forzar corte' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (showForceDeadlineModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deadline-modal-title"
          >
            <h3 id="deadline-modal-title" class="text-lg font-bold text-gray-900">
              {{
                deadlineState() === 'DEADLINE_REACHED'
                  ? 'Vencer fecha límite de pago'
                  : 'Forzar fecha límite de pago'
              }}
            </h3>
            <div class="mt-4 space-y-3 text-sm text-gray-700">
              @if (deadlineState() === 'DEADLINE_REACHED') {
                <p>
                  Se avanzará al día posterior de la fecha límite. En este paso sí se evaluarán
                  pagos conciliados, atrasos, recargos y excedentes.
                </p>
                <p>
                  Para clasificar faltas de pago debe estar procesado el archivo bancario final de
                  cada sucursal.
                </p>
              } @else {
                <p>
                  Se llegará exactamente a la fecha límite. Los pagos de este día se consideran
                  puntuales, no anticipados.
                </p>
                <p>
                  En este paso no se marcarán atrasos, no se aplicarán recargos y todavía no se
                  exigirá el archivo bancario final.
                </p>
              }
              <div>
                <label for="deadline-reason" class="mb-1 block font-semibold"
                  >Motivo (opcional)</label
                ><input
                  id="deadline-reason"
                  class="min-h-11 w-full rounded border p-2 text-base"
                  [(ngModel)]="deadlineMotivo"
                  placeholder="Ej. Cierre de prueba del periodo"
                />
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <button
                class="min-h-11 rounded px-4 py-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600"
                (click)="closeForceDeadlineModal()"
                [disabled]="deadlineState() === 'PROCESSING'"
              >
                Cancelar
              </button>
              <button
                class="min-h-11 rounded bg-amber-700 px-4 py-2 font-bold text-white hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 disabled:opacity-50"
                (click)="executeForcePaymentDeadline()"
                [disabled]="deadlineState() === 'PROCESSING'"
              >
                {{
                  deadlineState() === 'PROCESSING'
                    ? 'Procesando...'
                    : deadlineState() === 'DEADLINE_REACHED'
                      ? 'Confirmar evaluación de atrasos'
                      : 'Confirmar fecha límite'
                }}
              </button>
            </div>
          </div>
        </div>
      }
    }
    @if (canExecuteRefunds()) {
      <section class="space-y-3">
        <div>
          <h2 class="font-bold">Devoluciones autorizadas</h2>
          <p class="text-sm text-gray-600">Transferencias pendientes de ejecutar por Caja.</p>
        </div>
        <div class="overflow-x-auto rounded-xl border bg-white">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="border-b bg-gray-50">
              <tr>
                <th class="p-3">Distribuidora</th>
                <th class="p-3">Origen</th>
                <th class="p-3 text-right">Monto</th>
                <th class="p-3">Cuenta destino</th>
                <th class="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (refund of authorizedRefunds(); track refund.id) {
                <tr>
                  <td class="p-3">{{ refund.distributor_name || 'Distribuidora' }}</td>
                  <td class="p-3 font-mono">{{ refund.origin_relation_reference }}</td>
                  <td class="p-3 text-right font-bold">{{ refund.amount | currency: 'MXN' }}</td>
                  <td class="p-3">
                    <span class="block">{{
                      refund.destination_bank_account?.bank_name || 'Cuenta no disponible'
                    }}</span>
                    @if (refund.destination_bank_account) {
                      <span class="text-xs text-gray-600"
                        >CLABE terminación
                        {{ refund.destination_bank_account.clabe.slice(-4) }}</span
                      >
                    }
                  </td>
                  <td class="p-3 text-right">
                    <button
                      type="button"
                      class="rounded bg-emerald-700 px-3 py-2 font-bold text-white disabled:opacity-50"
                      [disabled]="!refund.destination_bank_account"
                      (click)="openRefundExecution(refund)"
                    >
                      Registrar devolución
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="p-5 text-center text-gray-500">
                    No hay devoluciones autorizadas pendientes.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (refundError()) {
          <p class="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">
            {{ refundError() }}
          </p>
        }
      </section>
    }
    @if (refundExecution(); as refund) {
      <div
        class="fixed inset-0 z-50 grid place-items-center bg-gray-950/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cashier-refund-title"
      >
        <section class="w-full max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-xl">
          <div>
            <h2 id="cashier-refund-title" class="text-xl font-bold">
              Registrar devolución simulada
            </h2>
            <p class="text-sm text-gray-600">
              Confirma la cuenta autorizada antes de registrar la transferencia.
            </p>
          </div>
          <dl class="grid gap-3 rounded-xl bg-emerald-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt class="text-emerald-800">Beneficiaria</dt>
              <dd class="font-bold">{{ refund.destination_bank_account?.account_holder_name }}</dd>
            </div>
            <div>
              <dt class="text-emerald-800">Banco</dt>
              <dd class="font-bold">{{ refund.destination_bank_account?.bank_name }}</dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-emerald-800">CLABE destino</dt>
              <dd class="break-all font-mono text-lg font-bold">
                {{ refund.destination_bank_account?.clabe }}
              </dd>
            </div>
            <div>
              <dt class="text-emerald-800">Importe</dt>
              <dd class="text-xl font-black">{{ refund.amount | currency: 'MXN' }}</dd>
            </div>
          </dl>
          <label class="block text-sm font-bold"
            >Referencia de transferencia<input
              class="mt-1 min-h-11 w-full rounded border p-2 font-normal"
              [(ngModel)]="refundReference"
              maxlength="100"
          /></label>
          <label class="block text-sm font-bold"
            >Comprobante privado<input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              class="mt-1 block w-full font-normal"
              (change)="selectRefundEvidence($event)"
          /></label>
          @if (refundEvidence(); as evidence) {
            <app-attachment-preview
              [file]="evidence"
              [fileName]="evidence.name"
              [mimeType]="evidence.type"
            ></app-attachment-preview>
          }
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded border px-4 py-2"
              [disabled]="refundBusy()"
              (click)="closeRefundExecution()"
            >
              Cancelar</button
            ><button
              type="button"
              class="rounded bg-emerald-700 px-4 py-2 font-bold text-white disabled:opacity-50"
              [disabled]="refundBusy() || !refundReference.trim() || !refundEvidence()"
              (click)="executeRefund(refund)"
            >
              {{ refundBusy() ? 'Registrando…' : 'Confirmar transferencia' }}
            </button>
          </div>
        </section>
      </div>
    }
    @if (canAudit()) {
      <section class="rounded-2xl border border-[var(--mv-border)] bg-white p-5 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-[var(--mv-primary-700)]">
              Control interno
            </p>
            <h2 class="mt-1 text-lg font-bold text-[var(--mv-text)]">Auditoría inmutable</h2>
            <p class="mt-1 text-sm text-[var(--mv-text-muted)]">
              Consulta actores, cambios y folios correlacionados dentro de tu alcance autorizado.
            </p>
          </div>
          <button
            class="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--mv-primary-700)] px-4 py-2 text-sm font-semibold text-white"
            (click)="openAudit()"
          >
            <lucide-icon name="scroll-text" class="h-4 w-4" aria-hidden="true"></lucide-icon>
            Abrir auditoría
          </button>
        </div>
      </section>
    }
    @if (canLogs()) {
      <section
        class="space-y-4 rounded-2xl border border-[var(--mv-border)] bg-[var(--mv-surface)] p-5 shadow-sm"
      >
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-[var(--mv-primary-700)]">
            Observabilidad
          </p>
          <h2 class="mt-1 text-lg font-bold text-[var(--mv-text)]">
            Logs operativos correlacionados
          </h2>
          <p class="mt-1 text-sm text-[var(--mv-text-muted)]">
            Busca una operación por folio y revisa su tiempo HTTP y actividad de base de datos sin
            mostrar payloads sensibles.
          </p>
        </div>
        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto]">
          <label class="text-sm font-semibold text-[var(--mv-text)]"
            >Folio de correlación
            <input
              class="mt-1 min-h-11 w-full rounded-xl border border-[var(--mv-border)] bg-white px-3 font-normal"
              [(ngModel)]="correlationId"
              placeholder="Pega el folio completo"
            />
          </label>
          <label class="text-sm font-semibold text-[var(--mv-text)]"
            >Canal
            <refactor-select
              class="mt-1 min-h-11 w-full rounded-xl border border-[var(--mv-border)] bg-white px-3 font-normal"
              [(ngModel)]="logChannel"
            >
              <option value="">Todos</option>
              <option value="OPERATION">Operación</option>
              <option value="ERROR">Errores</option>
              <option value="SECURITY">Seguridad</option>
              <option value="APPLICATION">Aplicación</option>
              <option value="AUDIT">Auditoría</option>
            </refactor-select>
          </label>
          <button
            class="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--mv-primary-600)] px-4 text-sm font-semibold text-[var(--mv-primary-800)] disabled:opacity-60"
            [disabled]="logsLoading()"
            (click)="loadLogs()"
          >
            <lucide-icon
              [name]="logsLoading() ? 'loader-2' : 'search'"
              class="h-4 w-4"
              [class.animate-spin]="logsLoading()"
              aria-hidden="true"
            ></lucide-icon>
            {{ logsLoading() ? 'Consultando' : 'Buscar' }}
          </button>
        </div>
        @if (logsError()) {
          <p
            class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            {{ logsError() }}
          </p>
        }
        @if (logsLoading()) {
          <div class="grid gap-3" aria-hidden="true">
            @for (placeholder of [1, 2, 3]; track placeholder) {
              <div class="h-24 animate-pulse rounded-xl bg-slate-100"></div>
            }
          </div>
        } @else {
          <div class="grid gap-3">
            @for (row of logs(); track row.id) {
              <article class="rounded-xl border border-[var(--mv-border)] bg-white p-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"
                        >{{ row.channel }}</span
                      ><span
                        class="text-xs font-semibold"
                        [class.text-red-700]="row.level === 'ERROR' || row.level === 'CRITICAL'"
                        [class.text-amber-700]="row.level === 'WARNING'"
                        >{{ row.level }}</span
                      >
                    </div>
                    <h3 class="mt-2 font-bold text-[var(--mv-text)]">{{ row.event }}</h3>
                  </div>
                  <time class="text-xs text-[var(--mv-text-muted)]">{{
                    row.occurred_at | date: 'medium'
                  }}</time>
                </div>
                <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt class="text-[var(--mv-text-muted)]">Solicitud</dt>
                    <dd class="mt-1 font-semibold">
                      {{ row.method || 'Sin dato' }} {{ row.path || '' }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-[var(--mv-text-muted)]">Respuesta</dt>
                    <dd class="mt-1 font-semibold tabular-nums">
                      {{ row.status_code || 'Sin dato' }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-[var(--mv-text-muted)]">Tiempo total</dt>
                    <dd class="mt-1 font-semibold tabular-nums">
                      {{ row.duration_ms === null ? 'Sin dato' : row.duration_ms + ' ms' }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-[var(--mv-text-muted)]">Consultas</dt>
                    <dd class="mt-1 font-semibold tabular-nums">
                      {{ row.context?.['db_query_count'] ?? 'Sin dato' }}
                    </dd>
                  </div>
                </dl>
                <details class="mt-4 border-t border-[var(--mv-border)] pt-3">
                  <summary
                    class="cursor-pointer text-sm font-semibold text-[var(--mv-primary-800)]"
                  >
                    Folios técnicos autorizados
                  </summary>
                  <dl class="mt-3 grid gap-2 break-all text-xs text-[var(--mv-text-muted)]">
                    <div>
                      <dt class="font-semibold text-[var(--mv-text)]">Correlación</dt>
                      <dd>{{ row.correlation_id || 'Sin dato' }}</dd>
                    </div>
                    <div>
                      <dt class="font-semibold text-[var(--mv-text)]">Solicitud</dt>
                      <dd>{{ row.request_id || 'Sin dato' }}</dd>
                    </div>
                    <div>
                      <dt class="font-semibold text-[var(--mv-text)]">Traza</dt>
                      <dd>{{ row.trace_id || 'Sin dato' }}</dd>
                    </div>
                  </dl>
                </details>
              </article>
            } @empty {
              <p
                class="rounded-xl border border-dashed border-[var(--mv-border)] p-5 text-sm text-[var(--mv-text-muted)]"
              >
                No hay logs para los filtros seleccionados.
              </p>
            }
          </div>
        }
      </section>
    }
  </section>`,
})
export class CentroOperacionPageComponent {
  private readonly api = inject(CentroOperacionApiService);
  private readonly reportsApi = inject(ReportsApiService);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly refundsApi = inject(ExcedentesApiService);
  private readonly mediaApi = inject(MediaApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly notifications = signal<NotificationItem[]>([]);
  readonly unreadCount = signal(0);
  readonly reports = signal<string[]>([]);
  readonly reportRows = signal<Record<string, unknown>[]>([]);
  readonly logs = signal<OperationalLog[]>([]);
  readonly logsLoading = signal(false);
  readonly logsError = signal('');
  readonly authorizedRefunds = signal<RefundRequest[]>([]);
  readonly refundExecution = signal<RefundRequest | null>(null);
  readonly refundEvidence = signal<File | null>(null);
  readonly refundBusy = signal(false);
  readonly refundError = signal('');
  refundReference = '';
  unreadOnly = false;
  selectedReport = '';
  dateFrom = '';
  dateTo = '';
  status = '';
  correlationId = '';
  logChannel = '';
  constructor() {
    if (this.canNotify()) {
      this.refreshNotificationState();
    }
    if (this.canReports()) this.reportsApi.list().subscribe((reports) => this.reports.set(reports));
    if (this.canExecuteRefunds()) this.loadAuthorizedRefunds();
  }
  canNotify(): boolean {
    return this.has('notifications.view_own');
  }
  canReports(): boolean {
    return this.any(['reports.view_branch', 'reports.view_global']);
  }
  canExecuteRefunds(): boolean {
    return this.session.roles().includes('cashier') && this.has('refunds.execute_branch');
  }
  loadAuthorizedRefunds(): void {
    this.refundsApi.refunds().subscribe({
      next: (items) => this.authorizedRefunds.set(items),
      error: () => this.refundError.set('No fue posible cargar las devoluciones autorizadas.'),
    });
  }
  openRefundExecution(refund: RefundRequest): void {
    this.refundExecution.set(refund);
    this.refundReference = '';
    this.refundEvidence.set(null);
    this.refundError.set('');
  }
  closeRefundExecution(): void {
    this.refundExecution.set(null);
    this.refundReference = '';
    this.refundEvidence.set(null);
  }
  selectRefundEvidence(event: Event): void {
    this.refundEvidence.set((event.target as HTMLInputElement).files?.[0] ?? null);
  }
  async executeRefund(refund: RefundRequest): Promise<void> {
    const file = this.refundEvidence();
    if (!file || !this.refundReference.trim()) return;
    this.refundBusy.set(true);
    this.refundError.set('');
    try {
      const media = await firstValueFrom(
        this.mediaApi.upload({
          file,
          owner_type: 'surplus_refund_request',
          owner_id: refund.id,
          purpose: 'REFUND_EVIDENCE',
        }),
      );
      await firstValueFrom(
        this.refundsApi.execute(refund.id, {
          amount: refund.amount,
          executed_at: new Date().toISOString(),
          method: 'TRANSFERENCIA_CLABE_SIMULADA',
          reference: this.refundReference.trim(),
          evidence_media_id: media.data.id,
        }),
      );
      this.closeRefundExecution();
      this.loadAuthorizedRefunds();
    } catch {
      this.refundError.set(
        'No fue posible registrar la devolución. Verifica la cuenta, referencia y comprobante.',
      );
    } finally {
      this.refundBusy.set(false);
    }
  }
  isGerenteGeneral(): boolean {
    return this.session.roles().includes('general_manager');
  }

  readonly cutoffSummary = signal<
    import('./centro-operacion-api.service').CurrentCutoffSummary | null
  >(null);
  readonly cutoffState = signal<'OPEN' | 'PROCESANDO' | 'CLOSED'>('OPEN');
  readonly showForceCutoffModal = signal(false);
  readonly cutoffGenerated = signal(false);
  readonly cutoffError = signal<string | null>(null);
  readonly deadlineState = signal<
    'IDLE' | 'PROCESSING' | 'DEADLINE_REACHED' | 'EXPIRED' | 'DEFERRED' | 'COMPLETED'
  >('IDLE');
  readonly showForceDeadlineModal = signal(false);
  readonly deadlineResult = signal<ForcePaymentDeadlineResponse | null>(null);
  readonly deadlineError = signal<string | null>(null);
  cutoffMotivo = '';
  deadlineMotivo = '';

  loadCurrentCutoff(): void {
    this.api.getCurrentCutoffSummary().subscribe({
      next: (summary) => {
        this.cutoffSummary.set(summary);
        if (summary.payment_period) {
          this.cutoffGenerated.set(true);
          if (summary.payment_period.status === 'COMPLETED') {
            this.cutoffState.set('OPEN');
            this.deadlineState.set('COMPLETED');
            this.deadlineResult.set({
              success: true,
              replayed: true,
              status: 'COMPLETED',
              process_run_id: summary.payment_period.process_run_id,
              evaluated_at:
                summary.payment_period.evaluated_at ?? summary.payment_period.payment_deadline_at,
              outcomes: summary.payment_period.outcomes ?? undefined,
            });
          } else if (summary.payment_period.status === 'DEADLINE_REACHED') {
            this.cutoffState.set('CLOSED');
            this.deadlineState.set('DEADLINE_REACHED');
          } else if (summary.payment_period.status === 'EXPIRED') {
            this.cutoffState.set('OPEN');
            this.deadlineState.set('EXPIRED');
          } else {
            this.cutoffState.set('CLOSED');
          }
        }
      },
      error: () => this.cutoffError.set('Error cargando el resumen del corte.'),
    });
  }

  openForceCutoffModal(): void {
    this.showForceCutoffModal.set(true);
    this.cutoffMotivo = '';
    this.cutoffError.set(null);
  }

  closeForceCutoffModal(): void {
    this.showForceCutoffModal.set(false);
  }

  executeForceCutoff(): void {
    this.cutoffState.set('PROCESANDO');
    this.cutoffError.set(null);
    const idempotencyKey = crypto.randomUUID();

    this.api.forceCutoff(this.cutoffMotivo, idempotencyKey).subscribe({
      next: (response) => {
        this.cutoffState.set('CLOSED');
        this.cutoffGenerated.set(true);
        this.showForceCutoffModal.set(false);
        this.loadCurrentCutoff();
      },
      error: (err) => {
        this.cutoffState.set('OPEN');
        this.cutoffError.set(err.error?.message || 'Error desconocido al procesar el cierre.');
      },
    });
  }

  openForceDeadlineModal(): void {
    this.showForceDeadlineModal.set(true);
    this.deadlineMotivo = '';
    this.deadlineError.set(null);
  }

  closeForceDeadlineModal(): void {
    this.showForceDeadlineModal.set(false);
  }

  executeForcePaymentDeadline(): void {
    this.deadlineState.set('PROCESSING');
    this.deadlineError.set(null);
    this.api.forcePaymentDeadline(this.deadlineMotivo, crypto.randomUUID()).subscribe({
      next: (response) => {
        this.deadlineResult.set(response);
        this.deadlineState.set(response.status);
        this.showForceDeadlineModal.set(false);
        this.loadCurrentCutoff();
      },
      error: (error) => {
        this.deadlineState.set('IDLE');
        this.deadlineError.set(error.error?.message || 'No fue posible evaluar la fecha límite.');
      },
    });
  }

  canAudit(): boolean {
    return this.any(['audit.view_branch', 'audit.view_global']);
  }
  canLogs(): boolean {
    return this.any(['logs.view_branch', 'logs.view_global']);
  }
  loadNotifications(): void {
    this.api.notifications(this.unreadOnly).subscribe((page) => this.notifications.set(page.data));
  }
  private refreshNotificationState(): void {
    this.loadNotifications();
    this.api.unreadCount().subscribe((count) => this.unreadCount.set(count));
  }
  mark(item: NotificationItem): void {
    this.api.markRead(item.id).subscribe(() => {
      this.loadNotifications();
      this.api.unreadCount().subscribe((count) => this.unreadCount.set(count));
    });
  }
  open(item: NotificationItem): void {
    this.mark(item);
    void this.router.navigateByUrl(item.data.deep_link);
  }
  runReport(): void {
    if (!this.selectedReport) return;
    const filters: Record<string, string> = {};
    if (this.dateFrom) filters['date_from'] = this.dateFrom;
    if (this.dateTo) filters['date_to'] = this.dateTo;
    if (this.status) filters['status'] = this.status;
    this.reportsApi
      .run(this.selectedReport, filters)
      .subscribe((page) => this.reportRows.set(page.data));
  }
  loadLogs(): void {
    this.logsLoading.set(true);
    this.logsError.set('');
    const filters: Record<string, string> = {};
    if (this.correlationId.trim()) filters['correlation_id'] = this.correlationId.trim();
    if (this.logChannel) filters['channel'] = this.logChannel;
    this.api.logs(filters).subscribe({
      next: (page) => {
        this.logs.set(page.data);
        this.logsLoading.set(false);
      },
      error: () => {
        this.logsLoading.set(false);
        this.logsError.set(
          'No fue posible consultar los logs. Conserva el folio e inténtalo nuevamente.',
        );
      },
    });
  }
  openAudit(): void {
    void this.router.navigateByUrl('/auditoria');
  }
  private has(permission: string): boolean {
    const permissions = this.session.permissions();
    return permissions.includes('all') || permissions.includes(permission);
  }
  private any(permissions: string[]): boolean {
    return permissions.some((permission) => this.has(permission));
  }

  puntosCorteAt = '';
  isExportingPuntos = false;

  presolStatus = 'TODOS';
  presolFrom = '';
  presolTo = '';
  isExportingPresol = false;

  private cdr = inject(ChangeDetectorRef);

  descargarPuntos(): void {
    this.isExportingPuntos = true;
    this.reportsApi.exportPointsBalance(this.puntosCorteAt).subscribe({
      next: (blob) => {
        const timestamp = new Date().toISOString().split('T')[0];
        const dateStr = this.puntosCorteAt
          ? `_corte_${this.puntosCorteAt}`
          : `_reporte_${timestamp}`;
        this.downloadBlob(blob, `saldo_puntos${dateStr}.xlsx`);
        this.isExportingPuntos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isExportingPuntos = false;
        this.cdr.detectChanges();
      },
    });
  }

  descargarPresolicitudes(): void {
    this.isExportingPresol = true;
    this.reportsApi.exportPreRequests(this.presolStatus, this.presolFrom, this.presolTo).subscribe({
      next: (blob) => {
        const timestamp = new Date().toISOString().split('T')[0];
        let name = `presolicitudes_${this.presolStatus.toLowerCase()}`;
        if (this.presolFrom) name += `_desde_${this.presolFrom}`;
        if (this.presolTo) name += `_hasta_${this.presolTo}`;
        if (!this.presolFrom && !this.presolTo) name += `_${timestamp}`;
        this.downloadBlob(blob, `${name}.xlsx`);
        this.isExportingPresol = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isExportingPresol = false;
        this.cdr.detectChanges();
      },
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
