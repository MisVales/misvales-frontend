import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { SessionStore } from '../../../core/session/session.store';
import { BankImport, ConciliacionApiService } from '../data-access/conciliacion-api.service';
@Component({
  selector: 'app-archivo-bancario-page',
  standalone: true,
  imports: [CommonModule],
  template: `<section class="space-y-6 p-6">
    <header>
      <h1 class="text-2xl font-bold">Archivo bancario</h1>
      <p class="text-sm text-gray-600">
        Carga manual del XLSX obtenido externamente. MisVales no se conecta al banco.
      </p>
    </header>
    @if (error()) {
      <div role="alert" class="rounded-lg bg-red-50 p-4 text-red-700">{{ error() }}</div>
    }
    @if (canUpload()) {
      <label class="block cursor-pointer rounded-xl border-2 border-dashed bg-white p-8 text-center"
        ><strong>Arrastra o selecciona un XLSX</strong>
        <p>Debe incluir referencia de pago, monto, fecha, folio bancario y concepto.</p>
        <input class="mt-4" type="file" accept=".xlsx" (change)="select($event)"
      /></label>
      @if (file()) {
        <div class="rounded-xl border bg-white p-4">
          <p>
            <strong>{{ file()?.name }}</strong> · {{ file()?.size }} bytes
          </p>
          <button
            class="mt-3 rounded-lg bg-blue-700 px-4 py-2 text-white"
            [disabled]="busy()"
            (click)="upload()"
          >
            Validar y procesar
          </button>
        </div>
      }
    }
    @if (result(); as item) {
      <div class="rounded-xl border bg-white p-5">
        <h2 class="font-bold">Resultado {{ item.status }}</h2>
        <p>{{ item.row_count }} filas</p>
        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          @for (entry of entries(item.summary); track entry[0]) {
            <div class="rounded-lg bg-gray-50 p-3">
              <span>{{ entry[0] }}</span
              ><strong class="block text-xl">{{ entry[1] }}</strong>
            </div>
          }
        </div>
      </div>
    }
    <section>
      <h2 class="mb-3 font-bold">Importaciones recientes</h2>
      @for (item of imports(); track item.id) {
        <div class="mb-2 rounded-xl border bg-white p-4">
          <strong>{{ item.status }}</strong> · {{ item.row_count }} filas ·
          {{ item.created_at | date: 'medium' }}
        </div>
      }
      @if (!imports().length) {
        <p class="text-gray-500">No hay importaciones visibles.</p>
      }
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
  constructor() {
    this.load();
  }
  canUpload(): boolean {
    return this.session.permissions().includes('bank_imports.create_branch');
  }
  select(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file.set(input.files?.[0] ?? null);
  }
  upload(): void {
    const file = this.file();
    if (!file) return;
    this.busy.set(true);
    this.error.set('');
    this.api.upload(file).subscribe({
      next: (v) => {
        this.result.set(v);
        this.busy.set(false);
        this.load();
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(e.error?.message ?? 'El archivo fue rechazado.');
      },
    });
  }
  entries(value?: Record<string, number>): [string, number][] {
    return Object.entries(value ?? {});
  }
  private load(): void {
    this.api.imports().subscribe({ next: (v) => this.imports.set(v), error: () => {} });
  }
}
