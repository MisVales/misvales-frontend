import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ConciliacionApiService } from '../data-access/conciliacion-api.service';

@Component({
  selector: 'app-bank-reconciliation-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="bank-actions-title">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Archivo bancario</p>
          <h2 id="bank-actions-title" class="mt-1 text-xl font-bold text-slate-950">Preparar conciliación</h2>
          <p class="mt-1 max-w-2xl text-sm text-slate-600">Descarga los movimientos bancarios simulados y carga el Excel final para procesar la conciliación del corte.</p>
        </div>
        @if (loading()) { <span class="text-sm text-slate-500">Consultando corte…</span> }
      </div>

      @if (!loading() && !available()) {
        <div class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900" role="status">
          <strong class="block">Acciones aún no disponibles</strong>
          <span>{{ availabilityMessage() }}</span>
        </div>
      }
      @if (error()) { <div role="alert" class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{{ error() }}</div> }
      @if (success()) { <div role="status" class="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{{ success() }}</div> }

      @if (available()) {
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 class="font-bold text-slate-950">1. Descargar Excel bancario</h3>
            <p class="mt-1 text-sm text-slate-600">Incluye {{ movementCount() }} movimientos simulados del corte actual.</p>
            <button type="button" class="mt-4 min-h-11 rounded-lg bg-slate-950 px-4 font-semibold text-white disabled:opacity-50" [disabled]="downloadBusy() || !movementCount()" (click)="download()">{{ downloadBusy() ? 'Preparando…' : 'Descargar Excel' }}</button>
          </article>
          <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 class="font-bold text-slate-950">2. Subir Excel para conciliar</h3>
            <p class="mt-1 text-sm text-slate-600">Acepta el archivo descargado o el formato XLSX entregado por el banco.</p>
            <label class="mt-4 inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-emerald-700 bg-white px-4 font-semibold text-emerald-800">
              Seleccionar Excel
              <input type="file" class="sr-only" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" (change)="select($event)" />
            </label>
            @if (file()) {
              <div class="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3">
                <span class="min-w-0 truncate text-sm font-medium">{{ file()?.name }}</span>
                <button type="button" class="min-h-11 rounded-lg bg-emerald-700 px-4 font-semibold text-white disabled:opacity-50" [disabled]="uploadBusy()" (click)="upload()">{{ uploadBusy() ? 'Procesando…' : 'Conciliar archivo' }}</button>
              </div>
            }
          </article>
        </div>
      }
    </section>
  `,
})
export class BankReconciliationActionsComponent {
  private readonly api = inject(ConciliacionApiService);
  readonly loading = signal(true);
  readonly available = signal(false);
  readonly availabilityMessage = signal('La descarga y la carga se habilitan cuando vence el corte vigente.');
  readonly movementCount = signal(0);
  readonly file = signal<File | null>(null);
  readonly downloadBusy = signal(false);
  readonly uploadBusy = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  constructor() { this.checkAvailability(); }

  select(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.error.set('');
    if (file && !file.name.toLocaleLowerCase('es-MX').endsWith('.xlsx')) {
      this.file.set(null); this.error.set('Selecciona un archivo XLSX válido.'); return;
    }
    this.file.set(file);
  }
  download(): void {
    this.downloadBusy.set(true); this.error.set('');
    this.api.exportSimulatedTransfers().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob); const link = document.createElement('a');
        link.href = url; link.download = `excel-bancario-${new Date().toISOString().slice(0, 10)}.xlsx`; link.click(); URL.revokeObjectURL(url);
        this.downloadBusy.set(false);
      },
      error: (error) => { this.downloadBusy.set(false); this.showError(error, 'No fue posible descargar el Excel bancario.'); },
    });
  }
  upload(): void {
    const file = this.file(); if (!file || !this.available()) return;
    this.uploadBusy.set(true); this.error.set(''); this.success.set('');
    this.api.upload(file).subscribe({
      next: (result) => { this.uploadBusy.set(false); this.file.set(null); this.success.set(result.replayed ? 'Ese archivo ya había sido procesado.' : `Conciliación procesada: ${result.row_count} movimientos.`); },
      error: (error) => { this.uploadBusy.set(false); this.showError(error, 'El archivo fue rechazado.'); },
    });
  }
  private checkAvailability(): void {
    this.api.simulatedTransfers().subscribe({
      next: (items) => { this.movementCount.set(items.length); this.available.set(true); this.loading.set(false); },
      error: (error: HttpErrorResponse) => { this.available.set(false); this.loading.set(false); this.availabilityMessage.set(error.error?.error?.message ?? this.availabilityMessage()); },
    });
  }
  private showError(error: unknown, fallback: string): void { this.error.set(error instanceof HttpErrorResponse ? error.error?.error?.message ?? error.error?.message ?? fallback : fallback); }
}
