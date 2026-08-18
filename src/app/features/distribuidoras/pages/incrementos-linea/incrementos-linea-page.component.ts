import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { CreditoApiService, CreditIncreaseView } from '../../data-access/api/credito-api.service';

@Component({
  selector: 'app-incrementos-linea-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="p-6 space-y-6">
      <header><h1 class="text-2xl font-bold text-gray-900">Incrementos de línea</h1><p class="text-sm text-gray-600">Bandeja limitada por rol, asignación y sucursal desde Laravel.</p></header>
      @if (error()) { <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{{ error() }}</div> }
      @if (loading()) { <p class="rounded-xl border bg-white p-6">Cargando solicitudes...</p> }
      @else if (!requests().length) { <div class="rounded-xl border border-dashed bg-white p-10 text-center text-gray-500">No existen solicitudes visibles.</div> }
      @else { <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.7fr)]">
        <div class="overflow-x-auto rounded-xl border bg-white shadow-sm"><table class="min-w-full text-sm"><thead class="bg-gray-50 text-left"><tr><th class="p-3">Solicitud</th><th class="p-3">Distribuidora</th><th class="p-3">Importes</th><th class="p-3">Estado</th></tr></thead><tbody>
          @for (request of requests(); track request.id) {
            <tr class="border-t hover:bg-blue-50" [class.bg-blue-50]="selected()?.id === request.id">
              <td class="p-3 font-semibold">
                <button
                  type="button"
                  class="rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                  [attr.aria-label]="'Abrir solicitud ' + request.request_number"
                  (click)="select(request.id)"
                >
                  {{ request.request_number }}<br>
                  <span class="font-normal text-gray-500">{{ request.requested_at | date:'short' }}</span>
                </button>
              </td>
              <td class="p-3">{{ request.distributor?.distributor_number }}<br><span class="text-gray-500">{{ request.distributor?.full_name }}</span></td>
              <td class="p-3">Solicitado: {{ request.requested_amount | currency:'MXN' }}<br><span class="text-gray-500">Recomendado: {{ request.recommended_amount ? (request.recommended_amount | currency:'MXN') : '—' }}</span></td>
              <td class="p-3"><span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold">{{ request.status }}</span></td>
            </tr>
          }
        </tbody></table></div>
        @if (selected(); as item) { <aside class="space-y-4 rounded-xl border bg-white p-5 shadow-sm"><div><h2 class="text-lg font-bold">{{ item.request_number }}</h2><p class="text-sm text-gray-500">{{ item.branch?.name || 'Sin sucursal visible' }}</p></div><dl class="grid grid-cols-2 gap-3 text-sm"><div><dt class="text-gray-500">Línea al solicitar</dt><dd>{{ item.line_total_at_request | currency:'MXN' }}</dd></div><div><dt class="text-gray-500">Disponible</dt><dd>{{ item.available_balance_at_request | currency:'MXN' }}</dd></div><div><dt class="text-gray-500">Solicitado</dt><dd>{{ item.requested_amount | currency:'MXN' }}</dd></div><div><dt class="text-gray-500">Recomendado</dt><dd>{{ item.recommended_amount ? (item.recommended_amount | currency:'MXN') : '—' }}</dd></div></dl><p class="rounded-lg bg-gray-50 p-3 text-sm"><strong>Motivo:</strong> {{ item.request_reason }}</p>
          @if (item.capabilities?.can_preauthorize || item.capabilities?.can_reject_by_coordinator) { <form class="space-y-3" (ngSubmit)="review(item)"><label class="block text-sm">Importe recomendado<input class="mt-1 w-full rounded-lg border p-2" [(ngModel)]="recommendedAmount" name="recommended" inputmode="decimal"></label><label class="block text-sm">Motivo obligatorio<textarea class="mt-1 w-full rounded-lg border p-2" [(ngModel)]="reason" name="coordinatorReason" maxlength="255" required></textarea></label><div class="flex gap-2">@if (item.capabilities?.can_preauthorize) { <button class="rounded-lg bg-blue-700 px-4 py-2 text-white" [disabled]="saving()" type="submit">Preautorizar</button> } @if (item.capabilities?.can_reject_by_coordinator) { <button class="rounded-lg border border-red-300 px-4 py-2 text-red-700" [disabled]="saving()" type="button" (click)="reject(item)">Rechazar</button> }</div></form> }
          @if (item.capabilities?.can_decide) { <form class="space-y-3" (ngSubmit)="decide(item)"><label class="block text-sm">Decisión<select class="mt-1 w-full rounded-lg border p-2" [(ngModel)]="decision" name="decision"><option value="APPROVE_REQUESTED">Autorizar solicitado</option><option value="APPROVE_LOWER">Autorizar menor</option><option value="REJECT">Rechazar</option></select></label>@if (decision === 'APPROVE_LOWER') { <label class="block text-sm">Importe autorizado<input class="mt-1 w-full rounded-lg border p-2" [(ngModel)]="authorizedAmount" name="authorized" inputmode="decimal" required></label> }<label class="block text-sm">Motivo obligatorio<textarea class="mt-1 w-full rounded-lg border p-2" [(ngModel)]="reason" name="managerReason" maxlength="255" required></textarea></label><button class="rounded-lg bg-blue-700 px-4 py-2 text-white" [disabled]="saving()">Confirmar decisión</button></form> }
        </aside> }
      </div> }
    </section>
  `,
})
export class IncrementosLineaPageComponent implements OnInit {
  private readonly api = inject(CreditoApiService);
  readonly requests = signal<CreditIncreaseView[]>([]);
  readonly selected = signal<CreditIncreaseView | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  recommendedAmount = '';
  authorizedAmount = '';
  reason = '';
  decision: 'APPROVE_REQUESTED' | 'APPROVE_LOWER' | 'REJECT' = 'APPROVE_REQUESTED';

  ngOnInit(): void { this.reload(); }
  reload(): void { this.api.listarIncrementos().subscribe({ next: response => { this.requests.set(response.data); this.loading.set(false); }, error: () => { this.error.set('No fue posible cargar las solicitudes.'); this.loading.set(false); } }); }
  select(id: string): void { this.api.consultarIncremento(id).subscribe({ next: value => { this.selected.set(value); this.reason = ''; this.recommendedAmount = value.recommended_amount ?? ''; }, error: () => this.error.set('No fue posible abrir la solicitud.') }); }
  review(item: CreditIncreaseView): void { if (!this.recommendedAmount || !this.reason.trim()) return; this.run(this.api.revisarIncremento(item.id, this.recommendedAmount, this.reason.trim(), item.lock_version)); }
  reject(item: CreditIncreaseView): void { if (!this.reason.trim()) return; this.run(this.api.rechazarCoordinador(item.id, this.reason.trim(), item.lock_version)); }
  decide(item: CreditIncreaseView): void { if (!this.reason.trim() || (this.decision === 'APPROVE_LOWER' && !this.authorizedAmount)) return; this.run(this.api.decidir(item.id, this.decision, this.reason.trim(), item.lock_version, this.authorizedAmount)); }
  private run(request: ReturnType<CreditoApiService['consultarIncremento']>): void { this.saving.set(true); this.error.set(''); request.pipe(finalize(() => this.saving.set(false))).subscribe({ next: value => { this.selected.set(value); this.requests.update(items => items.map(item => item.id === value.id ? value : item)); this.reason = ''; }, error: (error: HttpErrorResponse) => this.error.set(this.errorMessage(error)) }); }
  private errorMessage(error: HttpErrorResponse): string {
    return apiErrorMessage(
      error,
      'La operación fue rechazada. Verifica permisos, estado y versión de la solicitud.',
    );
  }
}
