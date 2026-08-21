import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionStore } from '../../../core/session/session.store';
import { BankImport, ConciliacionApiService } from '../data-access/conciliacion-api.service';

@Component({
  selector: 'app-archivo-bancario-page',
  standalone: true,
  imports: [CommonModule],
  template: `<section class="space-y-6 p-6">
    <header>
      <h1 class="text-2xl font-bold text-gray-950">Archivo bancario</h1>
      <p class="mt-1 text-sm text-gray-600">
        Carga el XLSX externo y revisa el resultado antes de continuar con aclaraciones.
      </p>
    </header>

    @if (error()) {
      <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <strong class="block">El archivo no pudo procesarse</strong>
        <span>{{ error() }}</span>
        @if (errorDetails().length) {
          <ul class="mt-2 list-disc space-y-1 pl-5">
            @for (detail of errorDetails(); track detail) {
              <li>{{ detail }}</li>
            }
          </ul>
        }
      </div>
    }

    @if (canUpload()) {
      <div class="rounded-xl border-2 border-dashed border-gray-300 bg-white p-6">
        <label for="bank-file" class="block font-semibold text-gray-900"
          >Selecciona un archivo XLSX</label
        >
        <p class="mt-1 text-sm text-gray-600">
          Columnas obligatorias: referencia de pago, monto, fecha, folio bancario y concepto.
        </p>
        <input
          id="bank-file"
          class="mt-4 block w-full text-sm"
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          (change)="select($event)"
        />
        @if (file()) {
          <div
            class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3"
          >
            <div>
              <strong class="block text-sm">{{ file()?.name }}</strong
              ><span class="text-xs text-gray-500">{{ file()?.size | number }} bytes</span>
            </div>
            <button
              class="min-h-11 rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              [disabled]="busy()"
              (click)="upload()"
            >
              {{ busy() ? 'Procesando…' : 'Validar y procesar' }}
            </button>
          </div>
        }
      </div>
    }

    @if (result(); as item) {
      <section class="rounded-xl border bg-white p-5 shadow-sm" aria-labelledby="processing-result">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="processing-result" class="font-bold text-gray-950">
              Resultado de la importación
            </h2>
            <p class="text-sm text-gray-600">
              {{ item.original_name }} · {{ item.row_count }} filas
            </p>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-bold"
            [class.bg-green-100]="item.status === 'PROCESSED'"
            [class.text-green-800]="item.status === 'PROCESSED'"
            >{{ item.replayed ? 'YA PROCESADO' : item.status }}</span
          >
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          @for (entry of entries(item.summary); track entry[0]) {
            <div class="rounded-lg border bg-gray-50 p-3">
              <span class="text-xs text-gray-600">{{ summaryLabel(entry[0]) }}</span
              ><strong class="block text-xl text-gray-950">{{ entry[1] }}</strong>
            </div>
          }
        </div>
      </section>
    }

    <section aria-labelledby="recent-imports">
      <h2 id="recent-imports" class="mb-3 font-bold text-gray-950">Importaciones recientes</h2>
      <div class="overflow-hidden rounded-xl border bg-white">
        @for (item of imports(); track item.id) {
          <article
            class="flex flex-wrap items-center justify-between gap-3 border-b p-4 last:border-0"
          >
            <div>
              <strong class="block text-sm">{{ item.original_name || 'Archivo bancario' }}</strong
              ><span class="text-xs text-gray-500"
                >{{ item.created_at | date: 'medium' }} · {{ item.row_count }} filas</span
              >
            </div>
            <span
              class="text-sm font-semibold"
              [class.text-green-700]="item.status === 'PROCESSED'"
              [class.text-red-700]="item.status === 'REJECTED'"
              >{{ item.status }}</span
            >
          </article>
        } @empty {
          <p class="p-6 text-center text-sm text-gray-500">No hay importaciones visibles.</p>
        }
      </div>
    </section>
  </section>`,
})
export class ArchivoBancarioPageComponent {
  private readonly api = inject(ConciliacionApiService);
  private readonly session = inject(SessionStore);
  readonly file = signal<File | null>(null);
  readonly result = signal<BankImport | null>(null);
  readonly imports = signal<BankImport[]>([]);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly errorDetails = signal<string[]>([]);

  constructor() {
    this.load();
  }

  canUpload(): boolean {
    return this.session.permissions().includes('bank_imports.create_branch');
  }

  select(event: Event): void {
    const selected = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.error.set('');
    this.errorDetails.set([]);
    if (selected && !selected.name.toLowerCase().endsWith('.xlsx')) {
      this.file.set(null);
      this.error.set('Selecciona un archivo con extensión .xlsx.');
      return;
    }
    this.file.set(selected);
  }

  upload(): void {
    const file = this.file();
    if (!file) return;
    this.busy.set(true);
    this.error.set('');
    this.errorDetails.set([]);
    this.api.upload(file).subscribe({
      next: (value) => {
        this.result.set(value);
        this.busy.set(false);
        this.load();
      },
      error: (response: HttpErrorResponse) => {
        this.busy.set(false);
        const apiError = response.error?.error;
        this.error.set(apiError?.message ?? 'El archivo fue rechazado.');
        const missing = apiError?.details?.missing_columns as string[] | undefined;
        const rows = apiError?.details?.rows as Record<string, string[]> | undefined;
        this.errorDetails.set(
          missing?.map((column) => `Falta la columna “${column}”.`) ??
            Object.entries(rows ?? {}).map(
              ([row, fields]) => `Fila ${row}: revisa ${fields.join(', ')}.`,
            ),
        );
      },
    });
  }

  entries(value?: Record<string, number>): [string, number][] {
    return Object.entries(value ?? {});
  }

  summaryLabel(key: string): string {
    return (
      (
        {
          partial_payments: 'Abonos',
          settlements: 'Liquidaciones',
          surpluses: 'Con excedente',
          unreconciled: 'No conciliados',
          duplicates: 'Duplicados',
        } as Record<string, string>
      )[key] ?? key
    );
  }

  private load(): void {
    this.api
      .imports()
      .subscribe({ next: (value) => this.imports.set(value), error: () => undefined });
  }
}
