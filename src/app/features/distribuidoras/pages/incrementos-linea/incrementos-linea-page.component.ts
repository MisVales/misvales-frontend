import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CreditoApiService, CreditIncreaseView } from '../../data-access/api/credito-api.service';

@Component({
  selector: 'app-incrementos-linea-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="p-6 space-y-6">
      <header><p class="text-xs font-semibold uppercase tracking-wider text-gray-500">Distribuidoras</p><h1 class="text-2xl font-bold text-gray-900">Incrementos de línea</h1><p class="text-sm text-gray-600">Solicitudes visibles conforme al alcance global de la sesión.</p></header>
      @if (loading()) { <p class="rounded-xl border bg-white p-6">Cargando solicitudes de incremento...</p> }
      @else if (error()) { <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{{ error() }}</div> }
      @else if (!requests().length) { <div class="rounded-xl border border-dashed bg-white p-10 text-center text-gray-500">No existen solicitudes de incremento.</div> }
      @else {
        <div class="overflow-x-auto rounded-xl border bg-white shadow-sm"><table class="min-w-full text-sm"><thead class="bg-gray-50 text-left text-gray-600"><tr><th class="p-3">Solicitud</th><th class="p-3">Distribuidora</th><th class="p-3">Sucursal</th><th class="p-3">Solicitado</th><th class="p-3">Autorizado</th><th class="p-3">Estado</th><th class="p-3">Fecha</th></tr></thead><tbody>
          @for (request of requests(); track request.id) { <tr class="border-t"><td class="p-3 font-semibold">{{ request.request_number }}</td><td class="p-3">{{ request.distributor?.distributor_number }}<br><span class="text-gray-500">{{ request.distributor?.full_name }}</span></td><td class="p-3">{{ request.branch?.name || '—' }}</td><td class="p-3">{{ request.requested_amount | currency:'MXN' }}</td><td class="p-3">{{ request.authorized_amount ? (request.authorized_amount | currency:'MXN') : '—' }}</td><td class="p-3"><span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold">{{ request.status }}</span></td><td class="p-3">{{ request.requested_at | date:'short' }}</td></tr> }
        </tbody></table></div>
      }
    </section>
  `,
})
export class IncrementosLineaPageComponent implements OnInit {
  private readonly api = inject(CreditoApiService);
  readonly requests = signal<CreditIncreaseView[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.api.listarIncrementos().subscribe({
      next: (response) => { this.requests.set(response.data); this.loading.set(false); },
      error: () => { this.error.set('No fue posible cargar las solicitudes de incremento.'); this.loading.set(false); },
    });
  }
}
