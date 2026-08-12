import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, map, Observable } from 'rxjs';
import { SessionStore } from '../../../../core/session/session.store';
import { CreditoApiService, CreditLineView } from '../../data-access/api/credito-api.service';

@Component({
  selector: 'app-lineas-credito-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="p-6 space-y-6">
      <header>
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">Distribuidoras</p>
        <h1 class="text-2xl font-bold text-gray-900">Líneas de crédito</h1>
        <p class="text-sm text-gray-600">Importes confirmados por el motor financiero de MisVales.</p>
      </header>
      @if (loading()) { <p class="rounded-xl border bg-white p-6">Cargando líneas de crédito...</p> }
      @else if (error()) { <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{{ error() }}</div> }
      @else if (!lines().length) { <div class="rounded-xl border border-dashed bg-white p-10 text-center text-gray-500">No existen líneas de crédito visibles.</div> }
      @else {
        <div class="overflow-x-auto rounded-xl border bg-white shadow-sm"><table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-left text-gray-600"><tr><th class="p-3">Distribuidora</th><th class="p-3">Total</th><th class="p-3">Utilizado</th><th class="p-3">Disponible</th><th class="p-3">Restricción</th></tr></thead>
          <tbody>@for (line of lines(); track line.id) {
            <tr class="border-t"><td class="p-3"><strong>{{ line.distributor.distributor_number }}</strong><br><span class="text-gray-500">{{ line.distributor.full_name }}</span></td><td class="p-3">{{ line.total_authorized | currency:'MXN' }}</td><td class="p-3">{{ line.used_balance | currency:'MXN' }}<br><span class="text-xs text-gray-500">{{ usedPercent(line) }}%</span></td><td class="p-3 font-semibold">{{ line.available_balance | currency:'MXN' }}</td><td class="p-3">@if (line.restriction) { <strong>Activa</strong><br><span class="text-xs">{{ line.restriction.lower_limit | currency:'MXN' }} a {{ line.restriction.upper_limit | currency:'MXN' }}</span> } @else { Sin restricción }</td></tr>
            @if (line.capabilities?.can_request_increase) { <tr><td colspan="5" class="border-t bg-gray-50 p-4"><form class="grid gap-3 md:grid-cols-[1fr_2fr_auto]" (ngSubmit)="requestIncrease(line)"><label class="text-sm">Importe solicitado<input class="mt-1 w-full rounded-lg border p-2" name="amount-{{line.id}}" [(ngModel)]="requestedAmount" inputmode="decimal" pattern="[0-9]+(\.[0-9]{1,4})?" required></label><label class="text-sm">Motivo<input class="mt-1 w-full rounded-lg border p-2" name="reason-{{line.id}}" [(ngModel)]="requestReason" maxlength="255" required></label><button class="self-end rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50" [disabled]="saving()">Solicitar incremento</button></form></td></tr> }
          }</tbody>
        </table></div>
      }
    </section>
  `,
})
export class LineasCreditoPageComponent implements OnInit {
  private readonly api = inject(CreditoApiService);
  private readonly session = inject(SessionStore);
  readonly lines = signal<CreditLineView[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  requestedAmount = '';
  requestReason = '';

  ngOnInit(): void {
    const query: Observable<CreditLineView[]> = this.session.roles().includes('distributor')
      ? this.api.consultarMiLinea().pipe(map(line => [line]))
      : this.api.listarLineas();
    query.subscribe({
      next: value => { this.lines.set(value); this.loading.set(false); },
      error: () => { this.error.set('No fue posible cargar las líneas de crédito.'); this.loading.set(false); },
    });
  }

  usedPercent(line: CreditLineView): string {
    const total = Number(line.total_authorized);
    return total > 0 ? ((Number(line.used_balance) / total) * 100).toFixed(1) : '0.0';
  }

  requestIncrease(line: CreditLineView): void {
    if (!this.requestedAmount || !this.requestReason.trim() || this.saving()) return;
    this.saving.set(true); this.error.set('');
    this.api.solicitarIncremento(line.distributor.id, this.requestedAmount, this.requestReason.trim(), line.lock_version)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => { this.requestedAmount = ''; this.requestReason = ''; if (line.capabilities) line.capabilities.can_request_increase = false; },
        error: () => this.error.set('No fue posible registrar la solicitud. Verifica el importe y el estado de la línea.'),
      });
  }
}
