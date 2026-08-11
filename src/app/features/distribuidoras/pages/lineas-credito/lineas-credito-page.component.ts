import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CreditoApiService, CreditLineView } from '../../data-access/api/credito-api.service';

@Component({
  selector: 'app-lineas-credito-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="p-6 space-y-6">
      <header><p class="text-xs font-semibold uppercase tracking-wider text-gray-500">Distribuidoras</p><h1 class="text-2xl font-bold text-gray-900">Líneas de crédito</h1><p class="text-sm text-gray-600">Consulta global de líneas autorizadas, utilizadas y disponibles.</p></header>
      @if (loading()) { <p class="rounded-xl border bg-white p-6">Cargando líneas de crédito...</p> }
      @else if (error()) { <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{{ error() }}</div> }
      @else if (!lines().length) { <div class="rounded-xl border border-dashed bg-white p-10 text-center text-gray-500">No existen líneas de crédito activadas.</div> }
      @else {
        <div class="overflow-x-auto rounded-xl border bg-white shadow-sm"><table class="min-w-full text-sm"><thead class="bg-gray-50 text-left text-gray-600"><tr><th class="p-3">Distribuidora</th><th class="p-3">Total autorizado</th><th class="p-3">Utilizado</th><th class="p-3">Disponible</th><th class="p-3">Restricción</th></tr></thead><tbody>
          @for (line of lines(); track line.id) { <tr class="border-t"><td class="p-3"><strong>{{ line.distributor.distributor_number }}</strong><br><span class="text-gray-500">{{ line.distributor.full_name }}</span></td><td class="p-3">{{ line.total_authorized | currency:'MXN' }}</td><td class="p-3">{{ line.used_balance | currency:'MXN' }}</td><td class="p-3 font-semibold">{{ line.available_balance | currency:'MXN' }}</td><td class="p-3">{{ line.restriction ? 'Activa' : 'Sin restricción' }}</td></tr> }
        </tbody></table></div>
      }
    </section>
  `,
})
export class LineasCreditoPageComponent implements OnInit {
  private readonly api = inject(CreditoApiService);
  readonly lines = signal<CreditLineView[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.api.listarLineas().subscribe({
      next: (lines) => { this.lines.set(lines); this.loading.set(false); },
      error: () => { this.error.set('No fue posible cargar las líneas de crédito.'); this.loading.set(false); },
    });
  }
}
