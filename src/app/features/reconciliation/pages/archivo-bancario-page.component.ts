import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { SessionStore } from '../../../core/session/session.store';
import {
  BankImport,
  ConciliacionApiService,
  PendingReconciliationPeriod,
  SimulatedBankTransfer,
} from '../data-access/conciliacion-api.service';
import { HistoryPageHeaderComponent } from '../../../shared/components/history/history-page-header.component';
import { HistoryFilterBarComponent } from '../../../shared/components/history/history-filter-bar.component';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

@Component({
  selector: 'app-archivo-bancario-page',
  standalone: true,
  imports: [
    CommonModule,
    HistoryPageHeaderComponent,
    HistoryFilterBarComponent,
    RefactorSelectComponent,
  ],
  templateUrl: './archivo-bancario-page.component.html',
})
export class ArchivoBancarioPageComponent {
  private readonly api = inject(ConciliacionApiService);
  private readonly session = inject(SessionStore);

  readonly file = signal<File | null>(null);
  readonly result = signal<BankImport | null>(null);
  readonly imports = signal<BankImport[]>([]);
  readonly pendingPeriods = signal<PendingReconciliationPeriod[]>([]);
  readonly selectedProcessRunId = signal('');
  readonly importSearch = signal('');
  readonly importStatus = signal('');
  readonly filteredImports = computed(() => {
    const search = this.importSearch().trim().toLocaleLowerCase('es-MX');
    const status = this.importStatus();
    return this.imports().filter(
      (item) =>
        (!search ||
          (item.original_name || 'Archivo bancario').toLocaleLowerCase('es-MX').includes(search)) &&
        (!status || item.status === status),
    );
  });
  readonly simulatedTransfers = signal<SimulatedBankTransfer[]>([]);
  readonly busy = signal(false);
  readonly exportBusy = signal(false);
  readonly error = signal('');
  readonly errorDetails = signal<string[]>([]);
  readonly success = signal('');
  readonly reconciliationAvailable = signal(false);
  readonly availabilityLoading = signal(true);
  readonly availabilityMessage = signal('');

  constructor() {
    this.load();
  }

  canUpload(): boolean {
    return (
      !this.session.roles().includes('general_manager') &&
      this.session.permissions().includes('bank_imports.create_branch')
    );
  }

  select(event: Event): void {
    const selected = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.clearMessages();
    if (selected && !selected.name.toLowerCase().endsWith('.xlsx')) {
      this.file.set(null);
      this.error.set('Selecciona un archivo con extensión .xlsx.');
      return;
    }
    this.file.set(selected);
  }

  upload(): void {
    const file = this.file();
    const processRunId = this.selectedProcessRunId();
    if (!file || !this.reconciliationAvailable() || !processRunId) return;
    this.busy.set(true);
    this.clearMessages();
    this.api.upload(file, processRunId).subscribe({
      next: (value) => {
        this.result.set(value);
        this.success.set(
          value.replayed
            ? 'Ese archivo ya había sido procesado.'
            : value.row_count === 0
              ? 'Periodo conciliado sin movimientos ni abonos.'
              : 'El archivo se procesó correctamente.',
        );
        this.busy.set(false);
        this.loadPendingPeriods();
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

  exportSimulations(): void {
    this.exportBusy.set(true);
    this.clearMessages();
    const processRunId = this.selectedProcessRunId();
    if (!processRunId) return;
    this.api.exportSimulatedTransfers(processRunId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `movimientos-bancarios-simulados-${new Date().toISOString().slice(0, 10)}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
        this.exportBusy.set(false);
      },
      error: () => {
        this.exportBusy.set(false);
        this.error.set('No fue posible descargar el Excel. Intenta nuevamente.');
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

  paymentTypeLabel(type: SimulatedBankTransfer['payment_type']): string {
    return {
      TRANSFER: 'Transferencia',
      ONLINE_BANKING: 'Banca en línea',
      COUNTER: 'Pago en ventanilla',
      CREDIT_BALANCE: 'Saldo a favor',
    }[type];
  }

  selectPeriod(processRunId: string): void {
    if (this.busy() || this.exportBusy()) return;
    this.selectedProcessRunId.set(processRunId);
    this.loadSimulations();
  }

  private clearMessages(): void {
    this.error.set('');
    this.errorDetails.set([]);
    this.success.set('');
  }

  private load(): void {
    if (this.canUpload()) {
      this.loadPendingPeriods();
    } else {
      this.loadImports();
      this.availabilityLoading.set(false);
    }
  }

  private loadPendingPeriods(): void {
    this.api.pendingPeriods().subscribe({
      next: (periods) => {
        this.pendingPeriods.set(periods);
        const selected = this.selectedProcessRunId();
        const next = periods.some((period) => period.process_run_id === selected)
          ? selected
          : (periods[0]?.process_run_id ?? '');
        this.selectedProcessRunId.set(next);
        if (next) this.loadSimulations();
        else {
          this.reconciliationAvailable.set(false);
          this.availabilityLoading.set(false);
        }
      },
      error: () => {
        this.pendingPeriods.set([]);
        this.reconciliationAvailable.set(false);
        this.availabilityLoading.set(false);
      },
    });
  }

  private loadImports(): void {
    this.api
      .imports()
      .subscribe({ next: (value) => this.imports.set(value), error: () => undefined });
  }

  private loadSimulations(): void {
    const processRunId = this.selectedProcessRunId();
    if (!processRunId) return;
    this.api.simulatedTransfers(processRunId).subscribe({
      next: (value) => {
        this.simulatedTransfers.set(value);
        this.reconciliationAvailable.set(true);
        this.availabilityLoading.set(false);
        this.loadImports();
      },
      error: (response: HttpErrorResponse) => {
        this.reconciliationAvailable.set(false);
        this.availabilityLoading.set(false);
        this.availabilityMessage.set(
          response.error?.error?.message ??
            'La conciliación todavía no está disponible para este corte.',
        );
      },
    });
  }
}
