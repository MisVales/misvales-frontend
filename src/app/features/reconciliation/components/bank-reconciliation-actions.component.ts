import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import {
  ConciliacionApiService,
  PendingReconciliationPeriod,
} from '../data-access/conciliacion-api.service';
import { BANK_XLSX_FILE_RULE, validateUploadFile } from '../../../shared/utils/files/file-validation';

@Component({
  selector: 'app-bank-reconciliation-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="bank-actions-title">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Archivo bancario</p>
          <h2 id="bank-actions-title" class="mt-1 text-xl font-bold text-slate-950">Conciliaciones pendientes</h2>
          <p class="mt-1 max-w-3xl text-sm text-slate-600">Procesa cada corte por separado. Se muestran del más nuevo al más antiguo.</p>
        </div>
        @if (loading()) { <span class="text-sm text-slate-500">Consultando cortes…</span> }
      </div>

      @if (globalError()) { <div role="alert" class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{{ globalError() }}</div> }
      @if (!loading() && periods().length === 0) {
        <div class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900" role="status">
          <strong class="block">No hay conciliaciones pendientes</strong>
          <span>Las opciones aparecerán cuando exista un corte vencido por conciliar.</span>
        </div>
      }

      <div class="mt-5 space-y-4">
        @for (period of periods(); track period.process_run_id) {
          <article class="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 class="font-bold text-slate-950">Conciliación #{{ period.reconciliation_number }}</h3>
                <p class="mt-1 text-sm text-slate-600">Corte: {{ period.cutoff_at | date: 'dd/MM/yyyy HH:mm' }} · {{ period.relations }} relaciones · {{ period.distributors }} distribuidoras</p>
              </div>
              <div class="sm:text-right"><span class="block text-xs font-semibold uppercase tracking-wide text-slate-500">Saldo pendiente</span><strong class="text-lg text-slate-950">{{ period.pending_total | currency: 'MXN' }}</strong></div>
            </div>
            @if (periodError(period.process_run_id)) { <div role="alert" class="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{{ periodError(period.process_run_id) }}</div> }
            @if (periodSuccess(period.process_run_id)) { <div role="status" class="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{{ periodSuccess(period.process_run_id) }}</div> }

            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <div class="rounded-lg border border-slate-200 bg-white p-4">
                <h4 class="font-bold text-slate-950">1. Descargar Excel bancario</h4>
                <p class="mt-1 text-sm text-slate-600">{{ movementCount(period.process_run_id) === null ? 'Consultando movimientos…' : 'Incluye ' + movementCount(period.process_run_id) + ' movimientos simulados de este corte.' }}</p>
                <button type="button" class="mt-4 min-h-11 rounded-lg bg-slate-950 px-4 font-semibold text-white disabled:opacity-50" [disabled]="isDownloading(period.process_run_id)" (click)="download(period)">{{ isDownloading(period.process_run_id) ? 'Preparando…' : 'Descargar Excel' }}</button>
              </div>
              <div class="rounded-lg border border-slate-200 bg-white p-4">
                <h4 class="font-bold text-slate-950">2. Subir Excel para conciliar</h4>
                <p class="mt-1 text-sm text-slate-600">Selecciona el XLSX correspondiente únicamente a esta conciliación.</p>
                <label class="mt-4 inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-emerald-700 bg-white px-4 font-semibold text-emerald-800">Seleccionar Excel<input type="file" class="sr-only" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" (change)="select(period.process_run_id, $event)" /></label>
                @if (selectedFileName(period.process_run_id); as selectedName) {
                  <div class="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
                    <span class="min-w-0 truncate text-sm font-medium">{{ selectedName }}</span>
                    <button type="button" class="min-h-11 rounded-lg bg-emerald-700 px-4 font-semibold text-white disabled:opacity-50" [disabled]="isUploading(period.process_run_id)" (click)="upload(period.process_run_id)">{{ isUploading(period.process_run_id) ? 'Procesando…' : 'Conciliar archivo' }}</button>
                  </div>
                }
              </div>
            </div>
          </article>
        }
      </div>
    </section>
  `,
})
export class BankReconciliationActionsComponent {
  private readonly api = inject(ConciliacionApiService);
  readonly loading = signal(true);
  readonly periods = signal<PendingReconciliationPeriod[]>([]);
  readonly globalError = signal('');
  private readonly counts = signal<Record<string, number | null>>({});
  private readonly selectedFiles = new Map<string, File>();
  private readonly fileNames = signal<Record<string, string>>({});
  private readonly downloading = signal<Record<string, boolean>>({});
  private readonly uploading = signal<Record<string, boolean>>({});
  private readonly errors = signal<Record<string, string>>({});
  private readonly successes = signal<Record<string, string>>({});

  constructor() { this.loadPeriods(); }

  movementCount(id: string): number | null { return this.counts()[id] ?? null; }
  selectedFileName(id: string): string { return this.fileNames()[id] ?? ''; }
  isDownloading(id: string): boolean { return this.downloading()[id] ?? false; }
  isUploading(id: string): boolean { return this.uploading()[id] ?? false; }
  periodError(id: string): string { return this.errors()[id] ?? ''; }
  periodSuccess(id: string): string { return this.successes()[id] ?? ''; }

  select(id: string, event: Event): void {
    try {
      this.readSelectedFile(id, event);
    } catch {
      this.clearSelectedFile(id);
      this.set(this.errors, id, 'No fue posible leer el archivo. Selecciona un XLSX vÃ¡lido.');
    }
  }

  private readSelectedFile(id: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;
    this.set(this.errors, id, ''); this.set(this.successes, id, '');
    if (!file) { this.clearSelectedFile(id); return; }
    const validationError = validateUploadFile(file, BANK_XLSX_FILE_RULE);
    if (validationError || !file.name.toLocaleLowerCase('es-MX').endsWith('.xlsx')) {
      this.clearSelectedFile(id);
      this.set(this.errors, id, validationError || 'Archivo inválido, solo acepta XLSX.');
      input.value = '';
      return;
    }
    this.selectedFiles.set(id, file);
    this.set(this.fileNames, id, file.name);
  }

  download(period: PendingReconciliationPeriod): void {
    const id = period.process_run_id;
    this.set(this.downloading, id, true); this.set(this.errors, id, '');
    this.api.exportSimulatedTransfers(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob); const link = document.createElement('a');
        link.href = url; link.download = `excel-bancario-conciliacion-${period.reconciliation_number}-${period.cutoff_at.slice(0, 10)}.xlsx`; link.click(); URL.revokeObjectURL(url);
        this.set(this.downloading, id, false);
      },
      error: (error) => { this.set(this.downloading, id, false); this.set(this.errors, id, this.message(error, 'No fue posible descargar el Excel bancario.')); },
    });
  }

  upload(id: string): void {
    const file = this.selectedFiles.get(id);
    if (!file) return;
    this.set(this.uploading, id, true); this.set(this.errors, id, ''); this.set(this.successes, id, '');
    this.api.upload(file, id).subscribe({
      next: (result) => {
        this.set(this.uploading, id, false); this.clearSelectedFile(id);
        this.set(this.successes, id, result.replayed ? 'Ese archivo ya había sido procesado.' : `Conciliación procesada: ${result.row_count} movimientos.`);
        this.loadPeriods();
      },
      error: (error) => { this.set(this.uploading, id, false); this.set(this.errors, id, this.message(error, 'El archivo fue rechazado.')); },
    });
  }

  private loadPeriods(): void {
    this.api.pendingPeriods().subscribe({
      next: (periods) => {
        const sorted = [...periods].sort((a, b) => new Date(b.cutoff_at).getTime() - new Date(a.cutoff_at).getTime());
        this.periods.set(sorted); this.loading.set(false);
        for (const period of sorted) this.loadCount(period.process_run_id);
      },
      error: (error) => { this.loading.set(false); this.globalError.set(this.message(error, 'No fue posible consultar las conciliaciones pendientes.')); },
    });
  }

  private loadCount(id: string): void {
    this.set(this.counts, id, null);
    this.api.simulatedTransfers(id).subscribe({
      next: (items) => this.set(this.counts, id, items.length),
      error: (error) => this.set(this.errors, id, this.message(error, 'No fue posible consultar los movimientos de este corte.')),
    });
  }

  private clearSelectedFile(id: string): void {
    this.selectedFiles.delete(id);
    this.set(this.fileNames, id, '');
  }

  private set<T>(target: WritableSignal<Record<string, T>>, id: string, value: T): void { target.update((current) => ({ ...current, [id]: value })); }
  private message(error: unknown, fallback: string): string { return error instanceof HttpErrorResponse ? error.error?.error?.message ?? error.error?.message ?? fallback : fallback; }
}
