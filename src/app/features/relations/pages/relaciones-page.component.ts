import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionStore } from '../../../core/session/session.store';
import { MediaApiService } from '../../../core/api/media/media-api.service';
import { ConciliacionApiService } from '@features/reconciliation/data-access/conciliacion-api.service';
import {
  PaginatedRelations,
  RelacionesApiService,
  RelationView,
} from '../data-access/relaciones-api.service';
import { StatusLabelPipe } from '../../../shared/pipes/status-label.pipe';
import { HistoryPageHeaderComponent } from '../../../shared/components/history/history-page-header.component';
import { HistoryPaginationComponent } from '../../../shared/components/history/history-pagination.component';
import { HistoryFilterBarComponent } from '../../../shared/components/history/history-filter-bar.component';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

type RelationDetailTab = 'summary' | 'installments' | 'payments' | 'breakdown';

@Component({
  selector: 'app-relaciones-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusLabelPipe,
    HistoryPageHeaderComponent,
    HistoryPaginationComponent,
    HistoryFilterBarComponent,
    RefactorSelectComponent,
  ],
  template: ` <section class="space-y-6 p-4 sm:p-6">
    <app-history-page-header
      eyebrow="Relaciones y pagos"
      [title]="selected() ? 'Detalle de la relación' : 'Historial de relaciones'"
      [description]="
        selected()
          ? 'Importes, partidas y movimientos del corte seleccionado.'
          : 'Estados de cuenta generados por corte, con la actividad más reciente primero.'
      "
    >
      @if (selected()) {
        <button
          type="button"
          (click)="selected.set(null)"
          class="min-h-11 rounded-lg border border-emerald-700 bg-white px-4 font-semibold text-emerald-800 hover:bg-emerald-50"
        >
          Volver al historial
        </button>
      }
    </app-history-page-header>

    @if (error()) {
      <div role="alert" class="rounded-lg bg-red-50 p-4 text-red-700">{{ error() }}</div>
    }

    @if (!selected()) {
      <app-history-filter-bar label="Filtros del historial de relaciones">
        <input
          type="search"
          class="min-h-11 rounded-lg border border-gray-300 bg-white px-3"
          placeholder="Distribuidora o referencia"
          [ngModel]="relationSearch()"
          (ngModelChange)="relationSearch.set($event)"
          (keyup.enter)="loadPage(1)"
        />
        <refactor-select
          class="min-h-11 rounded-lg border border-gray-300 bg-white px-3"
          [ngModel]="relationStatus()"
          (ngModelChange)="relationStatus.set($event)"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="PARTIALLY_PAID">Con abonos</option>
          <option value="SETTLED">Liquidadas</option>
        </refactor-select>
        <button
          type="button"
          class="min-h-11 rounded-lg bg-emerald-700 px-4 font-semibold text-white hover:bg-emerald-800"
          (click)="loadPage(1)"
        >
          Aplicar filtros
        </button>
      </app-history-filter-bar>
    }

    @if (!selected()) {
      <div class="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div class="space-y-3 p-3 sm:hidden">
          @if (!relations().length && !loading()) {
            <div
              class="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500"
            >
              No hay relaciones disponibles.
            </div>
          }
          @for (item of relations(); track item.id) {
            <button
              type="button"
              (click)="open(item.id)"
              class="block w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-[#386641]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#386641]"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-xs font-semibold uppercase tracking-wider text-[#386641]">
                    Relación
                  </p>
                  <h2 class="mt-1 truncate font-mono text-sm font-bold text-gray-900">
                    {{ item.payment_reference }}
                  </h2>
                </div>
                <span
                  class="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800"
                  >{{ item.financial_status | statusLabel }}</span
                >
              </div>
              <p class="mt-3 truncate text-sm font-medium text-gray-800">
                {{
                  item.header_snapshot['name'] ||
                    item.distribuidora?.distributor_number ||
                    'Distribuidora'
                }}
              </p>
              <div class="mt-3 grid grid-cols-2 gap-3 border-y border-gray-100 py-3">
                <div>
                  <p class="text-xs text-gray-500">Saldo pendiente</p>
                  <p class="mt-1 text-sm font-bold text-gray-900">
                    {{ item.balance | currency: 'MXN' }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Fecha límite</p>
                  <p class="mt-1 text-sm font-semibold text-gray-800">
                    {{ item.payment_deadline_at | date: 'mediumDate' }}
                  </p>
                </div>
              </div>
              <div class="mt-3 flex items-center justify-between gap-3 text-sm">
                <span class="text-gray-500">{{ extractPartialities(item) }} parcialidades</span
                ><span class="font-semibold text-[#386641]">Ver detalles →</span>
              </div>
            </button>
          }
        </div>
        <div class="hidden overflow-x-auto sm:block">
          <table class="w-full text-left text-sm">
            <thead class="border-b bg-gray-50 text-gray-600">
              <tr>
                <th class="p-4 font-medium">Distribuidora</th>
                <th class="p-4 font-medium">Corte</th>
                <th class="p-4 font-medium">Límite</th>
                <th class="p-4 font-medium">Referencia</th>
                <th class="p-4 font-medium">Parcialidades</th>
                <th class="p-4 text-right font-medium">Importe a pagar a MisVales</th>
                <th class="p-4 text-right font-medium">Saldo pendiente de la relación</th>
                <th class="p-4 font-medium">Estado</th>
                <th class="p-4 text-right font-medium">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @if (!relations().length && !loading()) {
                <tr>
                  <td colspan="9" class="p-6 text-center text-gray-500">
                    No hay relaciones disponibles.
                  </td>
                </tr>
              }
              @for (item of relations(); track item.id) {
                <tr class="hover:bg-gray-50">
                  <td class="p-4">
                    {{
                      item.header_snapshot['name'] || item.distribuidora?.distributor_number || '—'
                    }}
                  </td>
                  <td class="p-4">{{ item.cutoff_at | date: 'mediumDate' }}</td>
                  <td class="p-4">{{ item.payment_deadline_at | date: 'mediumDate' }}</td>
                  <td class="p-4 font-mono">{{ item.payment_reference }}</td>
                  <td class="p-4 text-gray-600">{{ extractPartialities(item) }}</td>
                  <td class="p-4 text-right font-semibold">
                    {{ item.misvales_total | currency: 'MXN' }}
                  </td>
                  <td class="p-4 text-right font-semibold">{{ item.balance | currency: 'MXN' }}</td>
                  <td class="p-4">
                    <span
                      class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                    >
                      {{ item.financial_status | statusLabel }}
                    </span>
                  </td>
                  <td class="p-4 text-right">
                    <button
                      (click)="open(item.id)"
                      class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <app-history-pagination
          class="block p-4"
          [page]="currentPage()"
          [pages]="lastPage()"
          [total]="total()"
          [busy]="loading()"
          noun="relaciones"
          label="Paginación de relaciones"
          (previous)="loadPage(currentPage() - 1)"
          (next)="loadPage(currentPage() + 1)"
        />
      </div>
    } @else {
      @if (selected(); as item) {
        <article class="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
          <div class="flex flex-wrap justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold">{{ item.payment_reference }}</h2>
              <p class="text-gray-600">
                Fecha límite: {{ item.payment_deadline_at | date: 'longDate' }} a las
                {{ item.payment_deadline_at | date: 'shortTime' }}
              </p>
            </div>
            <div class="text-right">
              <span class="text-sm text-gray-500 uppercase tracking-wide">Saldo pendiente</span>
              <p class="text-3xl font-bold">{{ item.balance | currency: 'MXN' }}</p>
            </div>
          </div>

          <nav
            class="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1"
            aria-label="Detalle financiero de la relación"
          >
            @for (tab of detailTabs; track tab.id) {
              <button
                type="button"
                class="min-h-11 shrink-0 rounded-lg px-4 text-sm font-semibold text-gray-600 transition-colors hover:bg-white hover:text-gray-950"
                [class.bg-white]="detailTab() === tab.id"
                [class.text-emerald-800]="detailTab() === tab.id"
                [class.shadow-sm]="detailTab() === tab.id"
                [attr.aria-current]="detailTab() === tab.id ? 'page' : null"
                (click)="detailTab.set(tab.id)"
              >
                {{ tab.label }}
              </button>
            }
          </nav>

          @if (detailTab() === 'summary') {
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-lg border bg-gray-50 p-4">
              <span class="text-sm text-gray-600">Cartera que corresponde cobrar a clientes</span>
              <strong class="block text-xl">{{ item.portfolio_total | currency: 'MXN' }}</strong>
            </div>
            <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <span class="text-sm font-medium text-emerald-800">Ganancia de la distribuidora</span>
              <strong class="block text-xl text-emerald-950">{{
                relationDistributorProfit(item) | currency: 'MXN'
              }}</strong>
              <small class="mt-1 block text-emerald-800"
                >No se incluye en tu pago a MisVales.</small
              >
            </div>
            <div class="rounded-lg border bg-blue-50 p-4">
              <span class="text-sm text-blue-700 font-medium">Importe a pagar a MisVales</span>
              <strong class="block text-xl text-blue-900">{{
                item.misvales_total | currency: 'MXN'
              }}</strong>
            </div>
            <div class="rounded-lg border bg-gray-50 p-4">
              <span class="text-sm text-gray-600">Pagado y conciliado por MisVales</span>
              <strong class="block text-xl">{{ item.reconciled_total | currency: 'MXN' }}</strong>
            </div>
          </div>

          <section class="grid gap-4 rounded-xl bg-gray-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span class="text-sm text-gray-500 block">Número</span
              ><strong class="block">{{ item.header_snapshot['number'] || '—' }}</strong>
            </div>
            <div>
              <span class="text-sm text-gray-500 block">Distribuidora</span
              ><strong class="block">{{ item.header_snapshot['name'] || '—' }}</strong>
            </div>
            <div>
              <span class="text-sm text-gray-500 block">Sucursal</span
              ><strong class="block">{{ item.header_snapshot['branch'] || '—' }}</strong>
            </div>
            <div>
              <span class="text-sm text-gray-500 block">Coordinador</span
              ><strong class="block">{{ item.header_snapshot['coordinator'] || '—' }}</strong>
            </div>
            <div>
              <span class="text-sm text-gray-500 block">Línea autorizada</span
              ><strong class="block">{{
                item.header_snapshot['credit_line_total'] | currency: 'MXN'
              }}</strong>
            </div>
            <div>
              <span class="text-sm text-gray-500 block">Saldo disponible</span
              ><strong class="block">{{
                item.header_snapshot['credit_available'] | currency: 'MXN'
              }}</strong>
            </div>
            <div class="col-span-2">
              <span class="text-sm text-gray-500 block">Domicilio</span
              ><strong class="block">{{ item.header_snapshot['address'] || '—' }}</strong>
            </div>
          </section>

          <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div class="rounded-xl border p-5">
              <h3 class="font-bold text-gray-800 mb-2">Periodo de pago anticipado</h3>
              <p class="text-sm">
                {{ item.advance_period_start | date: 'medium' }}<br />—<br />{{
                  item.advance_period_end | date: 'medium'
                }}
              </p>
            </div>
            <div class="rounded-xl border p-5">
              <h3 class="font-bold text-gray-800 mb-2">Datos bancarios publicados</h3>
              <p class="text-sm">
                {{ item.bank_snapshot['name'] }} · {{ item.bank_snapshot['beneficiary'] }}
              </p>
              <p class="text-sm mt-1">Convenio {{ item.bank_snapshot['agreement'] }}</p>
              <p class="text-sm font-mono mt-1">
                CLABE {{ maskedClabe(item.bank_snapshot['clabe']) }}
              </p>
            </div>
            <div class="rounded-xl border p-5 flex flex-col justify-center items-start">
              <h3 class="font-bold text-gray-800 mb-2">Referencia de pago</h3>
              <button
                class="flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 font-mono transition-colors"
                (click)="copy(item.payment_reference)"
              >
                {{ item.payment_reference }}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-copy"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </button>
            </div>
          </section>
          }

          @if (detailTab() === 'installments') {
            <section aria-labelledby="relation-installments-title">
              <div class="mb-3">
                <h3 id="relation-installments-title" class="text-lg font-bold text-gray-950">Parcialidades que generaron la relación</h3>
                <p class="text-sm text-gray-600">Lo que paga el cliente y lo que corresponde entregar a MisVales.</p>
              </div>
              <div class="grid gap-3 lg:grid-cols-2">
                @for (row of item.partidas ?? []; track row.id) {
                  <article class="rounded-xl border border-gray-200 p-4">
                    <div class="flex items-start justify-between gap-3">
                      <div><strong class="block text-gray-950">{{ row.snapshot['client'] || 'Cliente' }}</strong><span class="font-mono text-xs text-gray-500">{{ row.snapshot['folio'] || 'Sin folio' }}</span></div>
                      <span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">Parcialidad {{ row.snapshot['installment'] }} / {{ row.snapshot['total_installments'] }}</span>
                    </div>
                    <dl class="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-3 text-sm">
                      <div><dt class="text-gray-500">Cliente paga</dt><dd class="font-bold">{{ row.snapshot['client_payment'] | currency: 'MXN' }}</dd></div>
                      <div><dt class="text-gray-500">Para MisVales</dt><dd class="font-bold text-blue-800">{{ row.snapshot['misvales_payment'] | currency: 'MXN' }}</dd></div>
                      <div><dt class="text-gray-500">Ganancia distribuidora</dt><dd class="font-bold text-emerald-800">{{ row.snapshot['distributor_profit'] | currency: 'MXN' }}</dd></div>
                    </dl>
                  </article>
                } @empty {
                  <p class="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-600 lg:col-span-2">No hay parcialidades en esta relación.</p>
                }
              </div>
            </section>
          }

          @if (detailTab() === 'breakdown') {
          <section>
            <h3 class="text-lg font-bold mb-1">Desglose financiero completo</h3>
            <p class="mb-3 text-sm text-gray-600">Trazabilidad de los componentes congelados al generar cada vale.</p>
            <div class="overflow-x-auto rounded-lg border">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-50 text-gray-600">
                  <tr>
                    <th class="p-3">Producto</th>
                    <th class="p-3">Folio</th>
                    <th class="p-3">Cliente</th>
                    <th class="p-3 text-center">Parcialidad</th>
                    <th class="p-3 text-right">Capital</th>
                    <th class="p-3 text-right">Comisión del préstamo</th>
                    <th class="p-3 text-right">Interés</th>
                    <th class="p-3 text-right">Seguro</th>
                    <th class="p-3 text-right">Ganancia de la distribuidora</th>
                    <th class="p-3 text-right">Recargo</th>
                    <th class="p-3 text-right">Pago del cliente</th>
                    <th class="p-3 text-right font-medium text-blue-800">Importe para MisVales</th>
                    <th class="p-3 text-right">Pago conciliado</th>
                    <th class="p-3 text-right">Saldo pendiente</th>
                    <th class="p-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  @for (row of item.partidas ?? []; track row.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="p-3 whitespace-nowrap">{{ row.snapshot['product'] }}</td>
                      <td class="p-3 font-mono">{{ row.snapshot['folio'] }}</td>
                      <td class="p-3 min-w-[200px]">{{ row.snapshot['client'] }}</td>
                      <td class="p-3 text-center whitespace-nowrap">
                        <span class="rounded bg-gray-100 px-2 py-1"
                          >{{ row.snapshot['installment'] }} /
                          {{ row.snapshot['total_installments'] }}</span
                        >
                      </td>
                      <td class="p-3 text-right">
                        {{ row.snapshot['capital'] | currency: 'MXN' }}
                      </td>
                      <td class="p-3 text-right">
                        {{ row.snapshot['loan_commission'] | currency: 'MXN' }}
                      </td>
                      <td class="p-3 text-right">
                        {{ row.snapshot['interest'] | currency: 'MXN' }}
                      </td>
                      <td class="p-3 text-right">
                        {{ row.snapshot['insurance'] | currency: 'MXN' }}
                      </td>
                      <td class="p-3 text-right">
                        <strong class="block text-emerald-800">{{
                          row.snapshot['distributor_profit'] | currency: 'MXN'
                        }}</strong>
                        <small class="block text-gray-500">
                          {{ row.snapshot['category_name'] || 'Categoría congelada del vale' }}
                        </small>
                      </td>
                      <td class="p-3 text-right">
                        {{ row.snapshot['surcharge'] | currency: 'MXN' }}
                      </td>
                      <td class="p-3 text-right">
                        {{ row.snapshot['client_payment'] | currency: 'MXN' }}
                      </td>
                      <td class="p-3 text-right font-medium text-blue-800">
                        {{ row.snapshot['misvales_payment'] | currency: 'MXN' }}
                      </td>
                      <td class="p-3 text-right">
                        {{ row.snapshot['reconciled_payments'] | currency: 'MXN' }}
                      </td>
                      <td class="p-3 text-right">
                        {{ row.snapshot['balance'] | currency: 'MXN' }}
                      </td>
                      <td class="p-3 text-center">
                        <span
                          class="inline-flex rounded-full bg-gray-100 px-2 text-[10px] uppercase font-semibold text-gray-600"
                        >
                          {{ $any(row.snapshot['financial_status']) | statusLabel }}
                        </span>
                      </td>
                    </tr>
                  }
                  @if (!item.partidas?.length) {
                    <tr>
                      <td colspan="15" class="p-4 text-center text-gray-500">
                        No hay partidas en esta relación.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
          }

          @if (detailTab() === 'payments') {
          <section>
            <h3 class="text-lg font-bold mb-1">Pagos recibidos por MisVales</h3>
            <p class="mb-3 text-sm text-gray-600">Aplicación canónica del pago; sólo el capital aplicado recupera línea.</p>
            @for (payment of item.pagos ?? []; track payment.id) {
              <div class="mt-2 rounded-lg border bg-gray-50 p-4">
                <div class="flex justify-between items-center mb-2">
                  <div>
                    <strong class="text-lg text-green-700"
                      >Aplicado: {{ payment.amount | currency: 'MXN' }}</strong
                    >
                    @if (payment.bank_movement && +payment.bank_movement.surplus_amount > 0) {
                      <p class="mt-1 text-sm font-semibold text-amber-700">
                        Pago recibido: {{ payment.bank_movement.amount | currency: 'MXN' }}
                      </p>
                      <span
                        class="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800"
                        >Excedente:
                        {{ payment.bank_movement.surplus_amount | currency: 'MXN' }}</span
                      >
                    }
                  </div>
                  <span class="text-sm text-gray-500">{{
                    payment.applied_at | date: 'medium'
                  }}</span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-600">
                  <div>
                    Recargo: <strong>{{ payment.surcharge_applied | currency: 'MXN' }}</strong>
                  </div>
                  <div>
                    Interés: <strong>{{ payment.interest_applied | currency: 'MXN' }}</strong>
                  </div>
                  <div>
                    Seguro: <strong>{{ payment.insurance_applied | currency: 'MXN' }}</strong>
                  </div>
                  <div>
                    Comisión del préstamo:
                    <strong>{{ payment.commission_applied | currency: 'MXN' }}</strong>
                  </div>
                  <div>
                    Capital: <strong>{{ payment.capital_applied | currency: 'MXN' }}</strong>
                  </div>
                </div>
                <div class="mt-3 text-sm font-semibold text-blue-700">
                  Línea recuperada: {{ payment.line_recovered | currency: 'MXN' }}
                </div>
                <div class="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
                  <table class="w-full min-w-[680px] text-left text-xs">
                    <thead class="bg-gray-100 text-gray-700">
                      <tr>
                        <th class="p-2 font-semibold">Vale y cliente</th>
                        <th class="p-2 text-center font-semibold">Parcialidad</th>
                        <th class="p-2 font-semibold">Concepto pagado</th>
                        <th class="p-2 text-right font-semibold">Importe aplicado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      @for (allocation of payment.asignaciones ?? []; track allocation.id) {
                        <tr>
                          <td class="p-2">
                            <strong class="block font-mono text-gray-900">{{
                              allocation.partida_relacion?.snapshot?.['folio'] || 'Sin folio'
                            }}</strong>
                            <span class="text-gray-600">{{
                              allocation.partida_relacion?.snapshot?.['client'] ||
                                'Cliente sin dato'
                            }}</span>
                          </td>
                          <td class="p-2 text-center font-mono">
                            {{ allocation.partida_relacion?.snapshot?.['installment'] || '—' }}/{{
                              allocation.partida_relacion?.snapshot?.['total_installments'] || '—'
                            }}
                          </td>
                          <td class="p-2">{{ paymentComponentLabel(allocation.component) }}</td>
                          <td class="p-2 text-right font-bold tabular-nums">
                            {{ allocation.amount | currency: 'MXN' }}
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="4" class="p-3 text-center text-gray-500">
                            Este pago no tiene desglose por parcialidad disponible.
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
            @if (!item.pagos?.length) {
              <p class="text-gray-500 text-sm">No hay pagos aplicados en esta relación.</p>
            }

            @if (item.temporal_classification) {
              <div class="mt-4 rounded-lg bg-yellow-50 p-4 border border-yellow-100">
                <span class="text-yellow-800 text-sm">Comportamiento:</span>
                <strong class="block text-yellow-900">{{ item.temporal_classification }}</strong>
              </div>
            }
          </section>
          }

          @if (canClarify()) {
            <section
              class="rounded-xl border border-amber-200 bg-amber-50 p-5"
              aria-labelledby="clarification-title"
            >
              <h3 id="clarification-title" class="font-bold text-amber-950">
                Presentar aclaración de pago
              </h3>
              <p class="mt-1 text-sm text-amber-800">
                Adjunta el comprobante que respalda que el movimiento corresponde a esta relación.
                La cajera revisará la aclaración; no se aplicará dinero automáticamente.
              </p>
              @if (clarificationSuccess()) {
                <p role="status" class="mt-3 rounded-lg bg-green-100 p-3 text-sm text-green-800">
                  {{ clarificationSuccess() }}
                </p>
              }
              <div class="mt-4 grid gap-4 md:grid-cols-2">
                <label class="text-sm font-semibold text-amber-950"
                  >Comprobante<input
                    class="mt-1 block min-h-11 w-full rounded-lg border bg-white p-2 font-normal text-gray-900"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    (change)="selectClarificationFile($event)"
                /></label>
                <label class="text-sm font-semibold text-amber-950"
                  >Motivo<textarea
                    class="mt-1 min-h-24 w-full rounded-lg border bg-white p-3 font-normal text-gray-900"
                    maxlength="1000"
                    [ngModel]="clarificationReason()"
                    (ngModelChange)="clarificationReason.set($event)"
                  ></textarea>
                </label>
              </div>
              <button
                class="mt-4 min-h-11 rounded-lg bg-amber-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
                [disabled]="
                  clarificationBusy() || !clarificationFile() || !clarificationReason().trim()
                "
                (click)="submitClarification(item)"
              >
                {{ clarificationBusy() ? 'Enviando…' : 'Enviar aclaración' }}
              </button>
            </section>
          }

          @if (canDownload()) {
            <div class="pt-4 border-t">
              <button
                class="inline-flex items-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 px-5 py-2.5 font-medium text-white transition-colors"
                (click)="download(item)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-download"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Descargar relación
              </button>
            </div>
          }
        </article>
      }
    }
  </section>`,
})
export class RelacionesPageComponent {
  private readonly api = inject(RelacionesApiService);
  private readonly session = inject(SessionStore);
  private readonly mediaApi = inject(MediaApiService);
  private readonly reconciliationApi = inject(ConciliacionApiService);

  readonly relations = signal<RelationView[]>([]);
  readonly selected = signal<RelationView | null>(null);
  readonly detailTab = signal<RelationDetailTab>('summary');
  readonly detailTabs: ReadonlyArray<{ id: RelationDetailTab; label: string }> = [
    { id: 'summary', label: 'Resumen' },
    { id: 'installments', label: 'Parcialidades' },
    { id: 'payments', label: 'Pagos' },
    { id: 'breakdown', label: 'Desglose' },
  ];
  readonly error = signal('');

  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly relationSearch = signal('');
  readonly relationStatus = signal('');
  readonly clarificationFile = signal<File | null>(null);
  readonly clarificationReason = signal('');
  readonly clarificationBusy = signal(false);
  readonly clarificationSuccess = signal('');

  constructor() {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    this.api
      .list({ page, search: this.relationSearch().trim(), status: this.relationStatus() })
      .subscribe({
        next: (v) => {
          this.relations.set(v.data);
          this.currentPage.set(v.current_page);
          this.lastPage.set(v.last_page);
          this.total.set(v.total);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No fue posible consultar las relaciones.');
          this.loading.set(false);
        },
      });
  }

  open(id: string): void {
    this.error.set('');
    this.detailTab.set('summary');
    this.api.detail(id).subscribe({
      next: (v) => this.selected.set(v),
      error: () => this.error.set('No fue posible abrir la relación.'),
    });
  }

  extractPartialities(item: RelationView): string {
    if (!item.partidas || item.partidas.length === 0) return 'Ninguna';

    // Map items to "X/Y" format and get unique values
    const uniqueFormatted = Array.from(
      new Set(
        item.partidas.map(
          (p) => `${p.snapshot['installment']}/${p.snapshot['total_installments']}`,
        ),
      ),
    );

    if (uniqueFormatted.length <= 4) {
      return uniqueFormatted.join(', ');
    }

    // If more than 4, take first 3 and add a suffix
    return `${uniqueFormatted.slice(0, 3).join(', ')} (+${uniqueFormatted.length - 3} más)`;
  }

  relationDistributorProfit(item: RelationView): number {
    return (item.partidas ?? []).reduce(
      (total, partida) => total + Number(partida.snapshot['distributor_profit'] ?? 0),
      0,
    );
  }

  paymentComponentLabel(component: string): string {
    return (
      {
        SURCHARGE: 'Recargo',
        INTEREST: 'Interés',
        INSURANCE: 'Seguro',
        LOAN_COMMISSION: 'Comisión del préstamo',
        CAPITAL: 'Capital',
      }[component] ?? component
    );
  }

  canDownload(): boolean {
    return this.session
      .permissions()
      .some((p) =>
        [
          'relations.download_own',
          'relations.download_branch',
          'relations.download_global',
        ].includes(p),
      );
  }

  canClarify(): boolean {
    return (
      !this.session.roles().includes('general_manager') &&
      this.session.permissions().includes('payment_clarifications.create_own')
    );
  }

  selectClarificationFile(event: Event): void {
    this.clarificationFile.set((event.target as HTMLInputElement).files?.[0] ?? null);
  }

  submitClarification(relation: RelationView): void {
    const file = this.clarificationFile();
    const reason = this.clarificationReason().trim();
    if (!file || !reason) return;
    this.clarificationBusy.set(true);
    this.error.set('');
    this.clarificationSuccess.set('');
    this.mediaApi
      .upload({
        file,
        owner_type: 'distributor_relation',
        owner_id: relation.id,
        purpose: 'CLARIFICATION',
      })
      .subscribe({
        next: (media) =>
          this.reconciliationApi.createClarification(relation.id, media.data.id, reason).subscribe({
            next: () => {
              this.clarificationBusy.set(false);
              this.clarificationFile.set(null);
              this.clarificationReason.set('');
              this.clarificationSuccess.set(
                'La aclaración quedó disponible para revisión de Caja.',
              );
              this.open(relation.id);
            },
            error: (response: HttpErrorResponse) => {
              this.clarificationBusy.set(false);
              this.error.set(
                response.error?.error?.message ?? 'No fue posible registrar la aclaración.',
              );
            },
          }),
        error: (response: HttpErrorResponse) => {
          this.clarificationBusy.set(false);
          this.error.set(response.error?.error?.message ?? 'No fue posible cargar el comprobante.');
        },
      });
  }

  copy(value: string): void {
    void navigator.clipboard.writeText(value);
  }

  maskedClabe(value: string | number | null | undefined): string {
    const clabe = String(value ?? '');
    return clabe ? `•••• ${clabe.slice(-4)}` : '—';
  }

  download(item: RelationView): void {
    this.api.download(item.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relacion-${item.payment_reference}.html`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
