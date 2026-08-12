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
                    <th>Folio</th>
                    <th>Parcialidad</th>
                    <th>Cliente</th>
                    <th>MisVales</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of item.partidas ?? []; track row.id) {
                    <tr>
                      <td>{{ row.snapshot['folio'] }}</td>
                      <td>
                        {{ row.snapshot['installment'] }} / {{ row.snapshot['total_installments'] }}
                      </td>
                      <td>{{ row.portfolio_amount | currency: 'MXN' }}</td>
                      <td>{{ row.misvales_amount | currency: 'MXN' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
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
