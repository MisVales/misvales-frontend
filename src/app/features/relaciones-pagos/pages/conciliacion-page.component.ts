import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  BankMovement,
  ConciliacionApiService,
} from '../data-access/conciliacion-api.service';

@Component({
  selector: 'app-conciliacion-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-6 p-6">
      <header>
        <p class="text-xs font-semibold uppercase text-gray-500">M12</p>
        <h1 class="text-2xl font-bold">Conciliación bancaria</h1>
        <p class="text-sm text-gray-600">
          Resultado por movimiento del archivo externo; MisVales no se conecta al banco.
        </p>
      </header>
      @if (error()) {
        <div role="alert" class="rounded-lg bg-red-50 p-4 text-red-700">{{ error() }}</div>
      }
      <div class="overflow-x-auto rounded-xl border bg-white">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-3">Referencia</th>
              <th class="p-3">Folio bancario</th>
              <th class="p-3">Fecha</th>
              <th class="p-3">Importe</th>
              <th class="p-3">Clasificación</th>
              <th class="p-3">Aplicado</th>
              <th class="p-3">Excedente</th>
            </tr>
          </thead>
          <tbody>
            @for (item of movements(); track item.id) {
              <tr class="border-t">
                <td class="p-3 font-mono">{{ item.payment_reference }}</td>
                <td class="p-3">{{ item.bank_folio }}</td>
                <td class="p-3">{{ item.paid_at | date: 'short' }}</td>
                <td class="p-3">{{ item.amount | currency: 'MXN' }}</td>
                <td class="p-3"><strong>{{ item.classification }}</strong></td>
                <td class="p-3">{{ item.applied_amount | currency: 'MXN' }}</td>
                <td class="p-3">{{ item.surplus_amount | currency: 'MXN' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="p-6 text-center text-gray-500">No hay movimientos bancarios visibles.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class ConciliacionPageComponent {
  private readonly api = inject(ConciliacionApiService);
  readonly movements = signal<BankMovement[]>([]);
  readonly error = signal('');

  constructor() {
    this.api.movements().subscribe({
      next: (items) => this.movements.set(items),
      error: () => this.error.set('No fue posible consultar los movimientos conciliados.'),
    });
  }
}
