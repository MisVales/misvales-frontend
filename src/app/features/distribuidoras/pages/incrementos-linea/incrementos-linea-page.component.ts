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
      <header><h1 class="text-2xl font-bold text-gray-900">Incrementos de línea</h1><p class="text-sm text-gray-600">Consulta las solicitudes disponibles para tu sucursal.</p></header>
      @if (error()) { <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{{ error() }}</div> }
      @if (loading()) { <p class="rounded-xl border bg-white p-6">Cargando solicitudes...</p> }
      @else if (!requests().length) { <div class="rounded-xl border border-dashed bg-white p-10 text-center text-gray-500">No existen solicitudes visibles.</div> }
      @else { <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.7fr)]">
        <div class="space-y-3 sm:hidden">
          @for (request of requests(); track request.id) {
            <button type="button" (click)="select(request.id)" class="block w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-[#386641]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#386641]" [class.border-[#386641]]="selected()?.id === request.id" [class.bg-[#F3F8F4]]="selected()?.id === request.id">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0"><p class="text-xs font-semibold uppercase tracking-wider text-[#386641]">Solicitud</p><h2 class="mt-1 truncate text-base font-bold text-gray-900">{{ request.request_number }}</h2><p class="mt-1 text-xs text-gray-500">{{ request.requested_at | date:'mediumDate' }}</p></div>
                <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold" [class]="statusClass(request.status)">{{ statusLabel(request.status) }}</span>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-3 border-y border-gray-100 py-3 text-sm">
                <div><p class="text-xs text-gray-500">Solicitado</p><p class="mt-1 font-bold text-gray-900">{{ request.requested_amount | currency:'MXN' }}</p></div>
                <div><p class="text-xs text-gray-500">Recomendado</p><p class="mt-1 font-semibold text-gray-800">{{ request.recommended_amount ? (request.recommended_amount | currency:'MXN') : 'Pendiente' }}</p></div>
              </div>
              <div class="mt-3 flex items-center justify-between gap-3"><p class="min-w-0 truncate text-sm text-gray-600">{{ request.distributor?.full_name ?? 'Distribuidora sin nombre disponible' }}</p><span class="shrink-0 text-sm font-semibold text-[#386641]">Ver detalle →</span></div>
            </button>
          }
        </div>
        <div class="hidden overflow-x-auto rounded-xl border bg-white shadow-sm sm:block"><table class="min-w-full text-sm"><thead class="bg-gray-50 text-left"><tr><th class="p-3">Solicitud</th><th class="p-3">Distribuidora</th><th class="p-3">Importes</th><th class="p-3">Estado</th><th class="p-3 text-right">Acciones</th></tr></thead><tbody>
          @for (request of requests(); track request.id) {
            <tr class="border-t hover:bg-blue-50" [class.bg-blue-50]="selected()?.id === request.id">
              <td class="p-3 font-semibold">
                {{ request.request_number }}<br>
                <span class="font-normal text-gray-500">{{ request.requested_at | date:'short' }}</span>
              </td>
              <td class="p-3 font-medium">{{ request.distributor?.full_name ?? 'Distribuidora sin nombre disponible' }}</td>
              <td class="p-3">Solicitado: {{ request.requested_amount | currency:'MXN' }}<br><span class="text-gray-500">Recomendado: {{ request.recommended_amount ? (request.recommended_amount | currency:'MXN') : '—' }}</span></td>
              <td class="p-3"><span class="rounded-full px-2 py-1 text-xs font-semibold" [class]="statusClass(request.status)">{{ statusLabel(request.status) }}</span></td>
              <td class="p-3 text-right"><button type="button" class="rounded-lg bg-[#386641] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2f5937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#386641] focus-visible:ring-offset-2" [attr.aria-label]="'Ver solicitud ' + request.request_number" (click)="select(request.id)">Ver</button></td>
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
  private run(request: ReturnType<CreditoApiService['consultarIncremento']>): void { if (this.saving()) return; this.saving.set(true); this.error.set(''); request.pipe(finalize(() => this.saving.set(false))).subscribe({ next: value => { this.selected.set(value); this.requests.update(items => items.map(item => item.id === value.id ? value : item)); this.reason = ''; }, error: (error: HttpErrorResponse) => this.error.set(this.errorMessage(error)) }); }
  private errorMessage(error: HttpErrorResponse): string {
    return apiErrorMessage(
      error,
      'La operación fue rechazada. Verifica permisos, estado y versión de la solicitud.',
    );
  }
  statusLabel(status: string): string {
    return ({ REQUESTED: 'Pendiente de coordinación', PREAUTHORIZED: 'Pendiente de gerencia', AUTHORIZED_TOTAL: 'Autorizado', AUTHORIZED_PARTIAL: 'Autorizado parcialmente', REJECTED_BY_COORDINATOR: 'Rechazado por coordinación', REJECTED_BY_MANAGER: 'Rechazado por gerencia', COMPLETED: 'Completado' } as Record<string, string>)[status] ?? 'Estado actualizado';
  }
  statusClass(status: string): string {
    if (status.startsWith('AUTHORIZED') || status === 'COMPLETED') return 'bg-emerald-100 text-emerald-900';
    if (status.startsWith('REJECTED')) return 'bg-red-100 text-red-800';
    if (status === 'PREAUTHORIZED') return 'bg-amber-100 text-amber-900';
    return 'bg-sky-100 text-sky-900';
  }
}
