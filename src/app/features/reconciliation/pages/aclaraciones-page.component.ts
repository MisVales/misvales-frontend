import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { MediaApiService } from '@core/api/media/media-api.service';
import { StatusBadgeComponent, StatusBadgeTone } from '@shared/components/badges/status-badge/status-badge.component';
import { ExcedentesApiService, RefundRequest } from '@features/payments/data-access/excedentes-api.service';
import {
  BankMovement,
  ConciliacionApiService,
  ManualReconciliationRequest,
  PaymentClarification,
} from '../data-access/conciliacion-api.service';

type QueueKind = 'clarification' | 'unreconciled' | 'manual' | 'refund';
interface QueueItem {
  id: string;
  kind: QueueKind;
  type: string;
  relation: string;
  distributor: string;
  amount: string | null;
  status: string;
  createdAt: string;
  clarification?: PaymentClarification;
  movement?: BankMovement;
  manual?: ManualReconciliationRequest;
  refund?: RefundRequest;
}

@Component({
  selector: 'app-aclaraciones-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StatusBadgeComponent],
  template: `
    <section class="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Caja</p>
          <h1 class="text-2xl font-bold text-slate-950">Aclaraciones</h1>
          <p class="mt-1 max-w-3xl text-sm text-slate-600">
            Revisa pagos reportados, movimientos sin identificar, conciliaciones manuales y
            devoluciones. Las autorizaciones permanecen separadas de la ejecución de Caja.
          </p>
        </div>
        <button type="button" class="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-600 hover:text-emerald-700" (click)="load()">
          Actualizar
        </button>
      </header>

      @if (error()) { <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{{ error() }}</div> }
      @if (success()) { <div role="status" class="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{{ success() }}</div> }

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de aclaraciones">
        @for (summary of summaries(); track summary.label) {
          <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p class="text-sm text-slate-600">{{ summary.label }}</p>
            <strong class="mt-1 block text-2xl text-slate-950">{{ summary.value }}</strong>
          </article>
        }
      </section>

      <div class="flex flex-wrap gap-2" aria-label="Filtrar aclaraciones">
        @for (option of filters; track option.value) {
          <button type="button" class="min-h-11 rounded-full border px-4 text-sm font-semibold"
            [class.border-emerald-700]="filter() === option.value"
            [class.bg-emerald-50]="filter() === option.value"
            [class.text-emerald-800]="filter() === option.value"
            [class.border-slate-200]="filter() !== option.value"
            (click)="filter.set(option.value)">{{ option.label }}</button>
        }
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table class="min-w-[980px] w-full text-left text-sm">
          <thead class="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
            <tr><th class="p-4">Tipo</th><th class="p-4">Relación</th><th class="p-4">Distribuidora</th><th class="p-4 text-right">Monto</th><th class="p-4">Estado</th><th class="p-4">Fecha</th><th class="p-4 text-right">Acción</th></tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (item of visibleItems(); track item.kind + item.id) {
              <tr class="align-middle hover:bg-slate-50">
                <td class="p-4 font-semibold text-slate-950">{{ item.type }}</td>
                <td class="p-4 font-mono text-xs">{{ item.relation }}</td>
                <td class="p-4">{{ item.distributor }}</td>
                <td class="p-4 text-right font-semibold">{{ item.amount === null ? '—' : (item.amount | currency: 'MXN') }}</td>
                <td class="p-4"><app-status-badge [tone]="statusTone(item.status)">{{ statusLabel(item) }}</app-status-badge></td>
                <td class="p-4 whitespace-nowrap">{{ item.createdAt | date: 'short' }}</td>
                <td class="p-4 text-right">
                  @if (item.kind === 'clarification' && item.clarification) {
                    <button type="button" class="min-h-11 rounded-lg border border-blue-200 px-3 text-xs font-semibold text-blue-800" (click)="viewEvidence(item.clarification)">Revisar comprobante</button>
                  } @else if (item.kind === 'unreconciled') {
                    <a routerLink="/relaciones-pagos/conciliacion" class="inline-flex min-h-11 items-center rounded-lg border border-blue-200 px-3 text-xs font-semibold text-blue-800">Investigar y vincular</a>
                  } @else if (item.kind === 'manual' && item.manual?.status === 'AUTHORIZED') {
                    <button data-manager-action type="button" [disabled]="busy()" class="min-h-11 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white disabled:opacity-50" (click)="executeManual(item.manual!)">Aplicar</button>
                  } @else if (item.kind === 'refund' && item.refund?.status === 'AUTHORIZED') {
                    <button data-manager-action type="button" [disabled]="busy()" class="min-h-11 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white disabled:opacity-50" (click)="openRefund(item.refund!)">Registrar devolución</button>
                  } @else {
                    <span class="text-xs text-slate-500">Consulta e historial</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="p-10 text-center text-slate-500">{{ loading() ? 'Cargando aclaraciones…' : 'No hay casos para mostrar.' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    @if (refundTarget(); as refund) {
      <div class="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="refund-title">
        <section class="w-full max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-xl">
          <div><h2 id="refund-title" class="text-xl font-bold">Registrar devolución autorizada</h2><p class="text-sm text-slate-600">Importe autorizado: {{ refund.amount | currency: 'MXN' }}. Captura la operación externa realizada.</p></div>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="text-sm font-semibold">Fecha y hora<input type="datetime-local" class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 font-normal" [(ngModel)]="executedAt" /></label>
            <label class="text-sm font-semibold">Método<input class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 font-normal" maxlength="50" [(ngModel)]="method" /></label>
            <label class="text-sm font-semibold sm:col-span-2">Referencia o folio<input class="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 font-normal" maxlength="100" [(ngModel)]="reference" /></label>
          </div>
          <label class="block text-sm font-semibold">Comprobante privado<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" class="mt-1 block w-full text-sm font-normal" (change)="onEvidence($event)" /></label>
          <label class="block text-sm font-semibold">Observaciones<textarea rows="3" maxlength="2000" class="mt-1 w-full rounded-lg border border-slate-200 p-3 font-normal" [(ngModel)]="observations"></textarea></label>
          <div class="flex justify-end gap-3"><button type="button" class="min-h-11 rounded-lg border border-slate-200 px-4" (click)="closeRefund()">Cancelar</button><button data-manager-action type="button" [disabled]="busy()" class="min-h-11 rounded-lg bg-emerald-700 px-4 font-semibold text-white disabled:opacity-50" (click)="executeRefund(refund)">{{ busy() ? 'Registrando…' : 'Registrar devolución' }}</button></div>
        </section>
      </div>
    }
  `,
})
export class AclaracionesPageComponent {
  private readonly reconciliation = inject(ConciliacionApiService);
  private readonly surpluses = inject(ExcedentesApiService);
  private readonly media = inject(MediaApiService);
  readonly items = signal<QueueItem[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly filter = signal<QueueKind | 'all'>('all');
  readonly refundTarget = signal<RefundRequest | null>(null);
  readonly evidenceFile = signal<File | null>(null);
  readonly filters: { value: QueueKind | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' }, { value: 'clarification', label: 'Aclaraciones' },
    { value: 'unreconciled', label: 'No conciliados' }, { value: 'manual', label: 'Conciliaciones manuales' },
    { value: 'refund', label: 'Devoluciones' },
  ];
  method = '';
  reference = '';
  observations = '';
  executedAt = this.localDateTime();
  readonly visibleItems = computed(() => this.filter() === 'all' ? this.items() : this.items().filter((item) => item.kind === this.filter()));
  readonly summaries = computed(() => [
    { label: 'Pendientes de revisar', value: this.items().filter((item) => item.kind === 'clarification' && ['OPEN', 'IN_REVIEW'].includes(item.status)).length },
    { label: 'Pagos no conciliados', value: this.items().filter((item) => item.kind === 'unreconciled').length },
    { label: 'Listos para aplicar', value: this.items().filter((item) => item.kind === 'manual' && item.status === 'AUTHORIZED').length },
    { label: 'Devoluciones autorizadas', value: this.items().filter((item) => item.kind === 'refund' && item.status === 'AUTHORIZED').length },
  ]);

  constructor() { this.load(); }

  load(): void {
    this.loading.set(true); this.error.set('');
    forkJoin({
      clarifications: this.reconciliation.clarifications(),
      movements: this.reconciliation.movements({ status: 'UNRECONCILED' }),
      manuals: this.reconciliation.manualRequests(),
      refunds: this.surpluses.refunds(),
    }).subscribe({
      next: ({ clarifications, movements, manuals, refunds }) => {
        const rows: QueueItem[] = [
          ...clarifications.map((item) => ({ id: item.id, kind: 'clarification' as const, type: 'Aclaración de pago', relation: item.relation_reference || '—', distributor: item.distributor_name || item.distributor_number || 'Sin dato', amount: item.relation_balance, status: item.status, createdAt: item.created_at, clarification: item })),
          ...movements.map((item) => ({ id: item.id, kind: 'unreconciled' as const, type: 'Pago no conciliado', relation: item.relation_reference || 'Sin identificar', distributor: item.distributor_name || 'Sin identificar', amount: item.amount, status: item.reconciliation_status, createdAt: item.paid_at, movement: item })),
          ...manuals.map((item) => ({ id: item.id, kind: 'manual' as const, type: 'Conciliación manual', relation: item.relation_reference || '—', distributor: item.distributor_name || 'Sin dato', amount: item.amount, status: item.status, createdAt: item.created_at, manual: item })),
          ...refunds.map((item) => ({ id: item.id, kind: 'refund' as const, type: item.status === 'AUTHORIZED' ? 'Devolución autorizada' : 'Devolución', relation: item.origin_relation_reference || '—', distributor: item.distributor_name || 'Sin dato', amount: item.amount, status: item.status, createdAt: item.created_at, refund: item })),
        ];
        this.items.set(rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        this.loading.set(false);
      },
      error: (error) => { this.loading.set(false); this.showError(error, 'No fue posible cargar la bandeja de aclaraciones.'); },
    });
  }

  async viewEvidence(item: PaymentClarification): Promise<void> {
    try {
      const blob = await firstValueFrom(this.media.download(item.evidence_media_id));
      const url = URL.createObjectURL(blob); window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) { this.showError(error, 'No fue posible abrir el comprobante.'); }
  }

  async executeManual(item: ManualReconciliationRequest): Promise<void> {
    this.busy.set(true); this.error.set('');
    try { await firstValueFrom(this.reconciliation.executeManual(item.id)); this.success.set('La conciliación autorizada quedó aplicada.'); this.load(); }
    catch (error) { this.showError(error, 'No fue posible aplicar la conciliación.'); }
    finally { this.busy.set(false); }
  }

  openRefund(item: RefundRequest): void { this.resetRefund(); this.refundTarget.set(item); }
  closeRefund(): void { this.refundTarget.set(null); this.resetRefund(); }
  onEvidence(event: Event): void { this.evidenceFile.set((event.target as HTMLInputElement).files?.[0] ?? null); }

  async executeRefund(item: RefundRequest): Promise<void> {
    const file = this.evidenceFile();
    if (!file || !this.method.trim() || !this.reference.trim() || !this.executedAt) {
      this.error.set('Captura fecha, método, referencia y comprobante antes de registrar la devolución.'); return;
    }
    this.busy.set(true); this.error.set('');
    try {
      const uploaded = await firstValueFrom(this.media.upload({ file, owner_type: 'surplus_refund_request', owner_id: item.id, purpose: 'REFUND_EVIDENCE' }));
      await firstValueFrom(this.surpluses.execute(item.id, { amount: item.amount, executed_at: new Date(this.executedAt).toISOString(), method: this.method.trim(), reference: this.reference.trim(), evidence_media_id: uploaded.data.id, observations: this.observations.trim() || undefined }));
      this.closeRefund(); this.success.set('La devolución externa quedó registrada.'); this.load();
    } catch (error) { this.showError(error, 'No fue posible registrar la devolución.'); }
    finally { this.busy.set(false); }
  }

  statusLabel(item: QueueItem): string {
    return ({ OPEN: 'Pendiente de revisar', IN_REVIEW: 'En revisión', UNRECONCILED: 'Sin relación identificada', REQUESTED: 'Esperando autorización', AUTHORIZED: 'Autorizada', EXECUTED: item.kind === 'refund' ? 'Devuelta' : 'Aplicada', RESOLVED: 'Resuelta', REJECTED: 'Rechazada', CANCELLED: 'Cancelada' } as Record<string, string>)[item.status] ?? item.status;
  }
  statusTone(status: string): StatusBadgeTone {
    if (['EXECUTED', 'RESOLVED'].includes(status)) return 'success';
    if (['REJECTED', 'CANCELLED'].includes(status)) return 'danger';
    if (status === 'AUTHORIZED') return 'info';
    if (['OPEN', 'IN_REVIEW', 'UNRECONCILED', 'REQUESTED'].includes(status)) return 'warning';
    return 'neutral';
  }
  private resetRefund(): void { this.evidenceFile.set(null); this.method = ''; this.reference = ''; this.observations = ''; this.executedAt = this.localDateTime(); }
  private localDateTime(): string { const date = new Date(); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16); }
  private showError(error: unknown, fallback: string): void { this.error.set(error instanceof HttpErrorResponse ? error.error?.error?.message ?? error.error?.message ?? fallback : fallback); }
}
