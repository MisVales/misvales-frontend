import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { SessionStore } from '../../../core/session/session.store';
import { PaginatedRelations, RelacionesApiService, RelationView } from '../data-access/relaciones-api.service';
import { StatusLabelPipe } from '../../../shared/pipes/status-label.pipe';

@Component({
  selector: 'app-relaciones-page',
  standalone: true,
  imports: [CommonModule, StatusLabelPipe],
  template: ` <section class="space-y-6 p-6">
    <header class="flex items-center gap-4">
      @if (selected()) {
        <button
          (click)="selected.set(null)"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
          aria-label="Volver"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="h-5 w-5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
      }
      <div>
        <h1 class="text-2xl font-bold">Relaciones</h1>
        <p class="text-sm text-gray-600">Estado de cuenta generado por corte.</p>
      </div>
    </header>

    @if (error()) {
      <div role="alert" class="rounded-lg bg-red-50 p-4 text-red-700">{{ error() }}</div>
    }

    @if (!selected()) {
      <div class="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b bg-gray-50 text-gray-600">
              <tr>
                <th class="p-4 font-medium">Distribuidora</th>
                <th class="p-4 font-medium">Corte</th>
                <th class="p-4 font-medium">Límite</th>
                <th class="p-4 font-medium">Referencia</th>
                <th class="p-4 font-medium">Parcialidades</th>
                <th class="p-4 text-right font-medium">Total</th>
                <th class="p-4 text-right font-medium">Saldo</th>
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
                  <td class="p-4">{{ item.header_snapshot['name'] || item.distribuidora?.distributor_number || '—' }}</td>
                  <td class="p-4">{{ item.cutoff_at | date: 'mediumDate' }}</td>
                  <td class="p-4">{{ item.payment_deadline_at | date: 'mediumDate' }}</td>
                  <td class="p-4 font-mono">{{ item.payment_reference }}</td>
                  <td class="p-4 text-gray-600">{{ extractPartialities(item) }}</td>
                  <td class="p-4 text-right font-semibold">{{ item.misvales_total | currency: 'MXN' }}</td>
                  <td class="p-4 text-right font-semibold">{{ item.balance | currency: 'MXN' }}</td>
                  <td class="p-4">
                    <span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
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
        
        <div class="flex items-center justify-between border-t p-4 text-sm text-gray-600">
          <div>
            Página {{ currentPage() }} de {{ lastPage() }} ({{ total() }} relaciones)
          </div>
          <div class="flex gap-2">
            <button
              [disabled]="currentPage() <= 1 || loading()"
              (click)="loadPage(currentPage() - 1)"
              class="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              [disabled]="currentPage() >= lastPage() || loading()"
              (click)="loadPage(currentPage() + 1)"
              class="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    } @else {
      @if (selected(); as item) {
        <article class="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
          <div class="flex flex-wrap justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold">{{ item.payment_reference }}</h2>
              <p class="text-gray-600">Fecha límite: {{ item.payment_deadline_at | date: 'longDate' }} a las {{ item.payment_deadline_at | date: 'shortTime' }}</p>
            </div>
            <div class="text-right">
              <span class="text-sm text-gray-500 uppercase tracking-wide">Saldo pendiente</span>
              <p class="text-3xl font-bold">{{ item.balance | currency: 'MXN' }}</p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <div class="rounded-lg border bg-gray-50 p-4">
              <span class="text-sm text-gray-600">Total cartera</span>
              <strong class="block text-xl">{{ item.portfolio_total | currency: 'MXN' }}</strong>
            </div>
            <div class="rounded-lg border bg-blue-50 p-4">
              <span class="text-sm text-blue-700 font-medium">Exigible MisVales</span>
              <strong class="block text-xl text-blue-900">{{ item.misvales_total | currency: 'MXN' }}</strong>
            </div>
            <div class="rounded-lg border bg-gray-50 p-4">
              <span class="text-sm text-gray-600">Pagos conciliados</span>
              <strong class="block text-xl">{{ item.reconciled_total | currency: 'MXN' }}</strong>
            </div>
          </div>

          <section class="grid gap-4 rounded-xl bg-gray-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div><span class="text-sm text-gray-500 block">Número</span><strong class="block">{{ item.header_snapshot['number'] || '—' }}</strong></div>
            <div><span class="text-sm text-gray-500 block">Distribuidora</span><strong class="block">{{ item.header_snapshot['name'] || '—' }}</strong></div>
            <div><span class="text-sm text-gray-500 block">Sucursal</span><strong class="block">{{ item.header_snapshot['branch'] || '—' }}</strong></div>
            <div><span class="text-sm text-gray-500 block">Coordinador</span><strong class="block">{{ item.header_snapshot['coordinator'] || '—' }}</strong></div>
            <div><span class="text-sm text-gray-500 block">Línea autorizada</span><strong class="block">{{ item.header_snapshot['credit_line_total'] | currency: 'MXN' }}</strong></div>
            <div><span class="text-sm text-gray-500 block">Saldo disponible</span><strong class="block">{{ item.header_snapshot['credit_available'] | currency: 'MXN' }}</strong></div>
            <div class="col-span-2"><span class="text-sm text-gray-500 block">Domicilio</span><strong class="block">{{ item.header_snapshot['address'] || '—' }}</strong></div>
          </section>

          <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div class="rounded-xl border p-5">
              <h3 class="font-bold text-gray-800 mb-2">Periodo de pago anticipado</h3>
              <p class="text-sm">{{ item.advance_period_start | date: 'medium' }}<br/>—<br/>{{ item.advance_period_end | date: 'medium' }}</p>
            </div>
            <div class="rounded-xl border p-5">
              <h3 class="font-bold text-gray-800 mb-2">Datos bancarios publicados</h3>
              <p class="text-sm">{{ item.bank_snapshot['name'] }} · {{ item.bank_snapshot['beneficiary'] }}</p>
              <p class="text-sm mt-1">Convenio {{ item.bank_snapshot['agreement'] }}</p>
              <p class="text-sm font-mono mt-1">CLABE {{ maskedClabe(item.bank_snapshot['clabe']) }}</p>
            </div>
            <div class="rounded-xl border p-5 flex flex-col justify-center items-start">
              <h3 class="font-bold text-gray-800 mb-2">Referencia de pago</h3>
              <button class="flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 font-mono transition-colors" (click)="copy(item.payment_reference)">
                {{ item.payment_reference }}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            </div>
          </section>

          <section>
            <h3 class="text-lg font-bold mb-3 border-b pb-2">Partidas incluidas</h3>
            <div class="overflow-x-auto rounded-lg border">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-50 text-gray-600">
                  <tr>
                    <th class="p-3">Producto</th><th class="p-3">Folio</th><th class="p-3">Cliente</th><th class="p-3 text-center">Parcialidad</th>
                    <th class="p-3 text-right">Capital</th><th class="p-3 text-right">Comisión</th><th class="p-3 text-right">Interés</th><th class="p-3 text-right">Seguro</th>
                    <th class="p-3 text-right">Ganancia</th><th class="p-3 text-right">Recargo</th><th class="p-3 text-right">Pago cte.</th>
                    <th class="p-3 text-right font-medium text-blue-800">Exigible MisVales</th><th class="p-3 text-right">Conciliado</th><th class="p-3 text-right">Saldo</th><th class="p-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  @for (row of item.partidas ?? []; track row.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="p-3 whitespace-nowrap">{{ row.snapshot['product'] }}</td>
                      <td class="p-3 font-mono">{{ row.snapshot['folio'] }}</td>
                      <td class="p-3 min-w-[200px]">{{ row.snapshot['client'] }}</td>
                      <td class="p-3 text-center whitespace-nowrap">
                        <span class="rounded bg-gray-100 px-2 py-1">{{ row.snapshot['installment'] }} / {{ row.snapshot['total_installments'] }}</span>
                      </td>
                      <td class="p-3 text-right">{{ row.snapshot['capital'] | currency: 'MXN' }}</td>
                      <td class="p-3 text-right">{{ row.snapshot['loan_commission'] | currency: 'MXN' }}</td>
                      <td class="p-3 text-right">{{ row.snapshot['interest'] | currency: 'MXN' }}</td>
                      <td class="p-3 text-right">{{ row.snapshot['insurance'] | currency: 'MXN' }}</td>
                      <td class="p-3 text-right">{{ row.snapshot['distributor_profit'] | currency: 'MXN' }}</td>
                      <td class="p-3 text-right">{{ row.snapshot['surcharge'] | currency: 'MXN' }}</td>
                      <td class="p-3 text-right">{{ row.snapshot['client_payment'] | currency: 'MXN' }}</td>
                      <td class="p-3 text-right font-medium text-blue-800">{{ row.snapshot['misvales_payment'] | currency: 'MXN' }}</td>
                      <td class="p-3 text-right">{{ row.snapshot['reconciled_payments'] | currency: 'MXN' }}</td>
                      <td class="p-3 text-right">{{ row.snapshot['balance'] | currency: 'MXN' }}</td>
                      <td class="p-3 text-center">
                        <span class="inline-flex rounded-full bg-gray-100 px-2 text-[10px] uppercase font-semibold text-gray-600">
                          {{ $any(row.snapshot['financial_status']) | statusLabel }}
                        </span>
                      </td>
                    </tr>
                  }
                  @if (!item.partidas?.length) {
                    <tr><td colspan="15" class="p-4 text-center text-gray-500">No hay partidas en esta relación.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 class="text-lg font-bold mb-3 border-b pb-2">Pagos aplicados</h3>
            @for (payment of item.pagos ?? []; track payment.id) {
              <div class="mt-2 rounded-lg border bg-gray-50 p-4">
                <div class="flex justify-between items-center mb-2">
                  <strong class="text-lg text-green-700">+ {{ payment.amount | currency: 'MXN' }}</strong>
                  <span class="text-sm text-gray-500">{{ payment.applied_at | date: 'medium' }}</span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-600">
                  <div>Recargo: <strong>{{ payment.surcharge_applied | currency: 'MXN' }}</strong></div>
                  <div>Interés: <strong>{{ payment.interest_applied | currency: 'MXN' }}</strong></div>
                  <div>Seguro: <strong>{{ payment.insurance_applied | currency: 'MXN' }}</strong></div>
                  <div>Comisión: <strong>{{ payment.commission_applied | currency: 'MXN' }}</strong></div>
                  <div>Capital: <strong>{{ payment.capital_applied | currency: 'MXN' }}</strong></div>
                </div>
                <div class="mt-3 text-sm font-semibold text-blue-700">
                  Línea recuperada: {{ payment.line_recovered | currency: 'MXN' }}
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

          @if (canDownload()) {
            <div class="pt-4 border-t">
              <button class="inline-flex items-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 px-5 py-2.5 font-medium text-white transition-colors" (click)="download(item)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
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
  
  readonly relations = signal<RelationView[]>([]);
  readonly selected = signal<RelationView | null>(null);
  readonly error = signal('');
  
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  readonly total = signal(0);
  readonly loading = signal(false);

  constructor() {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.loading.set(true);
    this.api.list(page).subscribe({
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
    this.api.detail(id).subscribe({
      next: (v) => this.selected.set(v),
      error: () => this.error.set('No fue posible abrir la relación.'),
    });
  }

  extractPartialities(item: RelationView): string {
    if (!item.partidas || item.partidas.length === 0) return 'Ninguna';
    
    // Map items to "X/Y" format and get unique values
    const uniqueFormatted = Array.from(new Set(
      item.partidas.map(p => `${p.snapshot['installment']}/${p.snapshot['total_installments']}`)
    ));

    if (uniqueFormatted.length <= 4) {
      return uniqueFormatted.join(', ');
    }
    
    // If more than 4, take first 3 and add a suffix
    return `${uniqueFormatted.slice(0, 3).join(', ')} (+${uniqueFormatted.length - 3} más)`;
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
