import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { SessionStore } from '../../../core/session/session.store';
import { RelacionesApiService, RelationView } from '../data-access/relaciones-api.service';

@Component({
  selector: 'app-relaciones-page',
  standalone: true,
  imports: [CommonModule],
  template: ` <section class="space-y-6 p-6">
    <header>
      <p class="text-xs font-semibold uppercase text-gray-500">M11</p>
      <h1 class="text-2xl font-bold">Relaciones</h1>
      <p class="text-sm text-gray-600">Estado de cuenta generado por corte.</p>
    </header>
    @if (error()) {
      <div role="alert" class="rounded-lg bg-red-50 p-4 text-red-700">{{ error() }}</div>
    }
    <div class="grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
      <div class="space-y-3">
        @if (!relations().length) {
          <div class="rounded-xl border bg-white p-6 text-gray-500">
            No hay relaciones disponibles.
          </div>
        }
        @for (item of relations(); track item.id) {
          <button
            class="block w-full rounded-xl border bg-white p-4 text-left"
            (click)="open(item.id)"
          >
            <strong>{{ item.payment_reference }}</strong
            ><br /><span
              >{{ item.cutoff_at | date: 'mediumDate' }} · {{ item.financial_status }}</span
            ><br /><strong>{{ item.balance | currency: 'MXN' }}</strong>
          </button>
        }
      </div>
      @if (selected(); as item) {
        <article class="space-y-5 rounded-xl border bg-white p-5">
          <div class="flex flex-wrap justify-between gap-3">
            <div>
              <h2 class="text-xl font-bold">{{ item.payment_reference }}</h2>
              <p>Fecha límite {{ item.payment_deadline_at | date: 'medium' }}</p>
            </div>
            <div class="text-right">
              <span class="text-sm">Saldo</span>
              <p class="text-2xl font-bold">{{ item.balance | currency: 'MXN' }}</p>
            </div>
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            <div>
              <span>Total cartera</span
              ><strong class="block">{{ item.portfolio_total | currency: 'MXN' }}</strong>
            </div>
            <div>
              <span>Exigible MisVales</span
              ><strong class="block">{{ item.misvales_total | currency: 'MXN' }}</strong>
            </div>
            <div>
              <span>Pagos conciliados</span
              ><strong class="block">{{ item.reconciled_total | currency: 'MXN' }}</strong>
            </div>
          </div>
          <section class="grid gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><span>Número</span><strong class="block">{{ item.header_snapshot['number'] || '—' }}</strong></div>
            <div><span>Distribuidora</span><strong class="block">{{ item.header_snapshot['name'] || '—' }}</strong></div>
            <div><span>Sucursal</span><strong class="block">{{ item.header_snapshot['branch'] || '—' }}</strong></div>
            <div><span>Coordinador</span><strong class="block">{{ item.header_snapshot['coordinator'] || '—' }}</strong></div>
            <div><span>Línea autorizada</span><strong class="block">{{ item.header_snapshot['credit_line_total'] | currency: 'MXN' }}</strong></div>
            <div><span>Saldo disponible</span><strong class="block">{{ item.header_snapshot['credit_available'] | currency: 'MXN' }}</strong></div>
            <div><span>Domicilio</span><strong class="block">{{ item.header_snapshot['address'] || '—' }}</strong></div>
          </section>
          <section class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border p-4">
              <h3 class="font-bold">Periodo de pago anticipado</h3>
              <p>{{ item.advance_period_start | date: 'medium' }} — {{ item.advance_period_end | date: 'medium' }}</p>
            </div>
            <div class="rounded-lg border p-4">
              <h3 class="font-bold">Datos bancarios publicados</h3>
              <p>{{ item.bank_snapshot['name'] }} · {{ item.bank_snapshot['beneficiary'] }}</p>
              <p>Convenio {{ item.bank_snapshot['agreement'] }} · CLABE {{ maskedClabe(item.bank_snapshot['clabe']) }}</p>
            </div>
          </section>
          <section>
            <h3 class="font-bold">Referencia copiable</h3>
            <button class="rounded-lg bg-gray-100 px-3 py-2" (click)="copy(item.payment_reference)">
              {{ item.payment_reference }}
            </button>
          </section>
          <section>
            <h3 class="font-bold">Partidas</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr>
                    <th>Producto</th><th>Folio</th><th>Cliente</th><th>Parcialidad</th>
                    <th>Capital</th><th>Comisión del préstamo</th><th>Interés</th><th>Seguro</th>
                    <th>Ganancia de categoría</th><th>Recargo</th><th>Pago del cliente</th>
                    <th>Exigible MisVales</th><th>Conciliado</th><th>Saldo</th><th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of item.partidas ?? []; track row.id) {
                    <tr>
                      <td>{{ row.snapshot['product'] }}</td>
                      <td>{{ row.snapshot['folio'] }}</td>
                      <td>{{ row.snapshot['client'] }}</td>
                      <td>
                        {{ row.snapshot['installment'] }} / {{ row.snapshot['total_installments'] }}
                      </td>
                      <td>{{ row.snapshot['capital'] | currency: 'MXN' }}</td>
                      <td>{{ row.snapshot['loan_commission'] | currency: 'MXN' }}</td>
                      <td>{{ row.snapshot['interest'] | currency: 'MXN' }}</td>
                      <td>{{ row.snapshot['insurance'] | currency: 'MXN' }}</td>
                      <td>{{ row.snapshot['distributor_profit'] | currency: 'MXN' }}</td>
                      <td>{{ row.snapshot['surcharge'] | currency: 'MXN' }}</td>
                      <td>{{ row.snapshot['client_payment'] | currency: 'MXN' }}</td>
                      <td>{{ row.snapshot['misvales_payment'] | currency: 'MXN' }}</td>
                      <td>{{ row.snapshot['reconciled_payments'] | currency: 'MXN' }}</td>
                      <td>{{ row.snapshot['balance'] | currency: 'MXN' }}</td>
                      <td>{{ row.snapshot['financial_status'] }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <h3 class="font-bold">Pagos aplicados</h3>
            @for (payment of item.pagos ?? []; track payment.id) {
              <div class="mt-2 rounded-lg bg-gray-50 p-3">
                <strong>{{ payment.amount | currency: 'MXN' }}</strong> ·
                {{ payment.applied_at | date: 'medium' }}
                <p class="text-sm">
                  Recargo {{ payment.surcharge_applied | currency: 'MXN' }} · Interés
                  {{ payment.interest_applied | currency: 'MXN' }} · Seguro
                  {{ payment.insurance_applied | currency: 'MXN' }} · Comisión
                  {{ payment.commission_applied | currency: 'MXN' }} · Capital
                  {{ payment.capital_applied | currency: 'MXN' }}
                </p>
                <p class="text-sm font-semibold">
                  Línea recuperada {{ payment.line_recovered | currency: 'MXN' }}
                </p>
              </div>
            }
            @if (item.temporal_classification) {
              <p class="mt-3">
                Comportamiento: <strong>{{ item.temporal_classification }}</strong>
              </p>
            }
          </section>
          @if (canDownload()) {
            <button class="rounded-lg bg-blue-700 px-4 py-2 text-white" (click)="download(item)">
              Descargar relación
            </button>
          }
        </article>
      }
    </div>
  </section>`,
})
export class RelacionesPageComponent {
  private readonly api = inject(RelacionesApiService);
  private readonly session = inject(SessionStore);
  readonly relations = signal<RelationView[]>([]);
  readonly selected = signal<RelationView | null>(null);
  readonly error = signal('');
  constructor() {
    this.api.list().subscribe({
      next: (v) => this.relations.set(v),
      error: () => this.error.set('No fue posible consultar las relaciones.'),
    });
  }
  open(id: string): void {
    this.api.detail(id).subscribe({
      next: (v) => this.selected.set(v),
      error: () => this.error.set('No fue posible abrir la relación.'),
    });
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
