import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RelacionesApiService, RelationView } from '../data-access/relaciones-api.service';

@Component({
  selector: 'app-pagos-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-6 p-6">
      <header>
        <h1 class="text-2xl font-bold">Pagos y recuperación de línea</h1>
        <p class="text-sm text-gray-600">
          Aplicación por componente y recuperación exclusiva del capital conciliado.
        </p>
      </header>
      @if (error()) {
        <div role="alert" class="rounded-lg bg-red-50 p-4 text-red-700">{{ error() }}</div>
      }
      <div class="grid gap-4 lg:grid-cols-[.7fr_1.3fr]">
        <div class="space-y-2">
          @for (relation of relations(); track relation.id) {
            <button class="w-full rounded-xl border bg-white p-4 text-left" (click)="open(relation.id)">
              <strong>{{ relation.payment_reference }}</strong>
              <span class="block text-sm">{{ relation.financial_status }} · saldo {{ relation.balance | currency: 'MXN' }}</span>
            </button>
          } @empty {
            <p class="rounded-xl border bg-white p-6 text-gray-500">No hay relaciones con pagos visibles.</p>
          }
        </div>
        @if (selected(); as relation) {
          <article class="rounded-xl border bg-white p-5">
            <h2 class="text-lg font-bold">{{ relation.payment_reference }}</h2>
            <p class="mb-4">Clasificación: <strong>{{ relation.temporal_classification ?? 'PENDIENTE' }}</strong></p>
            @for (payment of relation.pagos ?? []; track payment.id) {
              <section class="mb-3 rounded-lg bg-gray-50 p-4">
                <div class="flex justify-between gap-3"><strong>{{ payment.amount | currency: 'MXN' }}</strong><span>{{ payment.applied_at | date: 'short' }}</span></div>
                <dl class="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                  <div><dt>Recargo</dt><dd>{{ payment.surcharge_applied | currency: 'MXN' }}</dd></div>
                  <div><dt>Interés</dt><dd>{{ payment.interest_applied | currency: 'MXN' }}</dd></div>
                  <div><dt>Seguro</dt><dd>{{ payment.insurance_applied | currency: 'MXN' }}</dd></div>
                  <div><dt>Comisión</dt><dd>{{ payment.commission_applied | currency: 'MXN' }}</dd></div>
                  <div><dt>Capital</dt><dd>{{ payment.capital_applied | currency: 'MXN' }}</dd></div>
                  <div><dt>Línea recuperada</dt><dd class="font-bold">{{ payment.line_recovered | currency: 'MXN' }}</dd></div>
                </dl>
              </section>
            } @empty {
              <p class="text-gray-500">La relación todavía no tiene pagos aplicados.</p>
            }
          </article>
        }
      </div>
    </section>
  `,
})
export class PagosPageComponent {
  private readonly api = inject(RelacionesApiService);
  readonly relations = signal<RelationView[]>([]);
  readonly selected = signal<RelationView | null>(null);
  readonly error = signal('');

  constructor() {
    this.api.list().subscribe({
      next: (items) => this.relations.set(items.data),
      error: () => this.error.set('No fue posible consultar los pagos.'),
    });
  }

  open(id: string): void {
    this.api.detail(id).subscribe({
      next: (item) => this.selected.set(item),
      error: () => this.error.set('No fue posible abrir el detalle del pago.'),
    });
  }
}
