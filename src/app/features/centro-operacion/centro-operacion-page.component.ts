import { CommonModule } from '@angular/common';
import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SessionStore } from '../../core/session/session.store';
import {
  CentroOperacionApiService,
  NotificationItem,
} from './centro-operacion-api.service';

@Component({
  selector: 'app-centro-operacion-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: ` <section class="operation-center space-y-6 p-4 md:p-6">
    <header class="operation-header flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="operation-eyebrow">MisVales · administración</p>
        <h1 class="text-2xl font-bold">Centro de operación</h1>
        <p class="mt-1 text-sm text-gray-600">
          Notificaciones, reportes, auditoría y logs correlacionados.
        </p>
      </div>
      @if (canNotify()) {
        <div
          class="rounded-full bg-red-700 px-3 py-2 text-sm text-white"
          aria-label="Notificaciones no leídas"
        >
          🔔 {{ unreadCount() }}
        </div>
      }
    </header>
    @if (canNotify()) {
      <section class="operation-section">
        <div class="flex items-center gap-3">
          <h2 class="font-bold">Notificaciones</h2>
          <label class="text-sm"
            ><input type="checkbox" [(ngModel)]="unreadOnly" (change)="loadNotifications()" /> Solo
            no leídas</label
          >
        </div>
        <div class="mt-4 grid gap-3">
          @for (item of notifications(); track item.id) {
            <article class="rounded-xl border bg-white p-4" [class.opacity-60]="item.read_at">
              <div class="flex justify-between gap-2">
                <strong>{{ item.data.title }}</strong
                ><small>{{ item.created_at | date: 'short' }}</small>
              </div>
              <p>{{ item.data.description }}</p>
              <div class="mt-2 flex gap-2">
                <button class="rounded border px-3 py-1" (click)="open(item)">Abrir recurso</button>
                @if (!item.read_at) {
                  <button class="rounded border px-3 py-1" (click)="mark(item)">
                    Marcar leída
                  </button>
                }
              </div>
            </article>
          } @empty {
            <p class="rounded border border-dashed p-4 text-gray-500">Sin notificaciones.</p>
          }
        </div>
      </section>
    }
    @if (canReports()) {
      <section class="operation-section space-y-4 mb-8">
        <h2 class="font-bold">Reportes Excel Especiales</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="operation-report-card rounded-xl border bg-white p-4">
          <h3 class="mb-3 font-bold text-gray-700">Saldo de puntos por distribuidora al corte</h3>
          <div class="flex flex-col gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <label class="text-sm text-gray-600 font-semibold">Día del corte:</label>
              <input class="rounded border p-2 text-sm" type="date" [(ngModel)]="puntosCorteAt" aria-label="Fecha del Corte" />
            </div>
            <button class="w-fit mt-2 rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50" (click)="descargarPuntos()" [disabled]="isExportingPuntos">
              {{ isExportingPuntos ? 'Exportando...' : 'Exportar Excel' }}
            </button>
          </div>
        </div>
        <div class="operation-report-card rounded-xl border bg-white p-4">
          <h3 class="mb-3 font-bold text-gray-700">Presolicitudes pendientes y validadas</h3>
          <div class="flex flex-col gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <label class="text-sm text-gray-600 font-semibold">Estado:</label>
              <select class="rounded border p-2 text-sm" [(ngModel)]="presolStatus">
                <option value="TODOS">Todos</option>
                <option value="PENDIENTES">Pendientes</option>
                <option value="VALIDADAS">Validadas</option>
              </select>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <label class="text-sm text-gray-600 font-semibold">Desde:</label>
              <input class="rounded border p-2 text-sm" type="date" [(ngModel)]="presolFrom" aria-label="Desde" />
              <label class="text-sm text-gray-600 font-semibold">Hasta:</label>
              <input class="rounded border p-2 text-sm" type="date" [(ngModel)]="presolTo" aria-label="Hasta" />
            </div>
            <button class="w-fit mt-1 rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50" (click)="descargarPresolicitudes()" [disabled]="isExportingPresol">
              {{ isExportingPresol ? 'Exportando...' : 'Exportar Excel' }}
            </button>
          </div>
        </div>
      </div>
      </section>

      <section class="operation-section space-y-3">
        <h2 class="font-bold">Reportes funcionales</h2>
        <div class="grid gap-2 md:grid-cols-5">
          <select class="rounded border p-2" [(ngModel)]="selectedReport">
            <option value="">Seleccione reporte</option>
            @for (report of reports(); track report) {
              <option [value]="report">{{ report }}</option>
            }</select
          ><input
            class="rounded border p-2"
            type="date"
            [(ngModel)]="dateFrom"
            aria-label="Desde"
          /><input
            class="rounded border p-2"
            type="date"
            [(ngModel)]="dateTo"
            aria-label="Hasta"
          /><input class="rounded border p-2" [(ngModel)]="status" placeholder="Estado" /><button
            class="rounded bg-indigo-700 px-3 py-2 text-white"
            (click)="runReport()"
          >
            Consultar
          </button>
        </div>
        <div class="overflow-x-auto rounded-xl border bg-white">
          <table class="min-w-full text-left text-xs">
            <tbody>
              @for (row of reportRows(); track $index) {
                <tr class="border-b">
                  <td class="p-3">
                    <pre class="whitespace-pre-wrap">{{ row | json }}</pre>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td class="p-4 text-gray-500">Sin datos consultados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    }
    @if (isGerenteGeneral()) {
      <section class="operation-section space-y-3">
        <h2 class="font-bold">Corte actual</h2>
        <div class="rounded-xl border bg-white p-4">
          @if (cutoffSummary(); as summary) {
            <div class="mb-4 text-sm space-y-2">
              <p><span class="font-semibold">Estado:</span> 
                <span class="rounded px-2 py-1 text-xs font-bold"
                      [class.bg-green-100]="cutoffState() === 'CLOSED'"
                      [class.text-green-800]="cutoffState() === 'CLOSED'"
                      [class.bg-blue-100]="cutoffState() === 'OPEN'"
                      [class.text-blue-800]="cutoffState() === 'OPEN'"
                      [class.bg-yellow-100]="cutoffState() === 'PROCESANDO'"
                      [class.text-yellow-800]="cutoffState() === 'PROCESANDO'"
                >
                  {{ cutoffState() === 'PROCESANDO' ? 'PROCESANDO CIERRE' : cutoffState() }}
                </span>
              </p>
              @if (cutoffState() === 'CLOSED' && closedProcessId()) {
                <p class="text-green-700 font-semibold">Corte cerrado correctamente.</p>
                <p>El corte fue forzado y cerrado exitosamente. Ref: {{ closedProcessId() }}</p>
              } @else {
                <p><span class="font-semibold">Último cierre:</span> {{ summary.period.start ? (summary.period.start | date:'medium') : 'N/A' }}</p>
                <p><span class="font-semibold">Fecha/hora proyectada:</span> {{ summary.period.projected_end | date:'medium' }}</p>
                <p><span class="font-semibold">Operaciones pendientes:</span> {{ summary.summary.operations }} ({{ summary.summary.distributors }} distribuidoras)</p>
                <p><span class="font-semibold">Total proyectado:</span> {{ summary.summary.total | currency }}</p>
              }
              @if (cutoffError()) {
                <p class="text-red-600 font-semibold">No fue posible cerrar el corte: {{ cutoffError() }}</p>
              }
            </div>
            @if (cutoffState() === 'OPEN' && summary.has_open_cutoff) {
              <button 
                class="rounded bg-red-600 px-4 py-2 font-bold text-white shadow hover:bg-red-700" 
                (click)="openForceCutoffModal()"
              >
                Forzar corte
              </button>
            } @else if (cutoffState() === 'OPEN') {
              <p class="text-gray-500 italic">No existe actualmente un periodo disponible para cierre manual.</p>
            }
          } @else {
            <p class="text-gray-500 text-sm">Cargando información del corte...</p>
          }
        </div>
      </section>

      @if (showForceCutoffModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 class="text-lg font-bold text-red-600 flex items-center gap-2">
              ⚠️ Forzar cierre del corte
            </h3>
            <div class="mt-4 text-sm text-gray-700 space-y-3">
              <p>Estás a punto de cerrar manualmente el corte actual.</p>
              <p>Esta acción cerrará el periodo utilizando la información registrada hasta este momento exacto.</p>
              <p>Una vez cerrado, la información correspondiente al corte será consolidada para generar saldos y referencias.</p>
              <div>
                <label class="block font-semibold mb-1">Motivo del cierre manual (opcional)</label>
                <input class="w-full rounded border p-2 text-sm" [(ngModel)]="cutoffMotivo" placeholder="Ej. Cierre solicitado por Gerencia" />
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <button class="rounded px-4 py-2 text-gray-600 hover:bg-gray-100" (click)="closeForceCutoffModal()" [disabled]="cutoffState() === 'PROCESANDO'">Cancelar</button>
              <button class="rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50" (click)="executeForceCutoff()" [disabled]="cutoffState() === 'PROCESANDO'">
                {{ cutoffState() === 'PROCESANDO' ? 'Procesando...' : 'Confirmar y forzar corte' }}
              </button>
            </div>
          </div>
        </div>
      }
    }
    @if (canAudit()) {
      <section class="operation-audit rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-emerald-950">Auditoría Inmutable del Sistema</h2>
          <p class="text-sm text-emerald-800">
            Consulta el registro completo de quién, cuándo, dónde y qué acciones se ejecutaron en el sistema con comparador de cambios en tiempo real.
          </p>
        </div>
        <a routerLink="/auditoria" class="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 transition">
          <span>Abrir Módulo de Auditoría</span>
          <span>→</span>
        </a>
      </section>
    }
  </section>`,
  styles: [`
    :host { display: block; }
    .operation-center { max-width: 84rem; margin: 0 auto; }
    .operation-eyebrow { margin: 0 0 .35rem; color: var(--mv-primary-700); font-size: .72rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    .operation-header { padding: 1.25rem; border: 1px solid var(--mv-border); border-radius: 1rem; background: linear-gradient(135deg, #fff 0%, #f0f7f1 100%); }
    .operation-section { padding: 1.25rem; border: 1px solid var(--mv-border); border-radius: 1rem; background: #fff; box-shadow: 0 1px 2px rgb(24 33 27 / .04); }
    .operation-report-card { height: 100%; border-color: var(--mv-border); }
    @media (max-width: 640px) {
      .operation-center { padding: .25rem 0 1rem; gap: 1rem; }
      .operation-header { padding: 1.15rem; align-items: flex-start; border-radius: .9rem; }
      .operation-header h1 { font-size: 1.55rem; line-height: 1.15; }
      .operation-header > div:last-child { width: 100%; }
      .operation-header [aria-label='Notificaciones no leídas'] { display: inline-flex; align-items: center; justify-content: center; min-height: 2.75rem; }
      .operation-section { padding: 1rem; border-radius: .9rem; }
      .operation-section > div:first-child { flex-wrap: wrap; align-items: flex-start; }
      .operation-section label { width: 100%; }
      .operation-section :where(input, select, button) { width: 100%; min-height: 2.75rem; }
      .operation-section .w-fit { width: 100%; }
      .operation-report-card { padding: 1rem; border-radius: .75rem; }
      .operation-report-card h3 { line-height: 1.35; }
      .operation-section .grid.md\\:grid-cols-5 { gap: .75rem; }
      .operation-section .overflow-x-auto { margin-inline: -.25rem; border-radius: .75rem; }
      .operation-audit { padding: 1.1rem; border-radius: .9rem; }
      .operation-audit a { width: 100%; justify-content: center; }
    }
  `],
})
export class CentroOperacionPageComponent {
  private readonly api = inject(CentroOperacionApiService);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  readonly notifications = signal<NotificationItem[]>([]);
  readonly unreadCount = signal(0);
  readonly reports = signal<string[]>([]);
  readonly reportRows = signal<Record<string, unknown>[]>([]);
  readonly audits = signal<Record<string, unknown>[]>([]);
  readonly logs = signal<Record<string, unknown>[]>([]);
  unreadOnly = false;
  selectedReport = '';
  dateFrom = '';
  dateTo = '';
  status = '';
  correlationId = '';
  constructor() {
    if (this.canNotify()) {
      this.loadNotifications();
      this.api.unreadCount().subscribe((count) => this.unreadCount.set(count));
    }
    if (this.canReports()) this.api.reports().subscribe((reports) => this.reports.set(reports));
    if (this.isGerenteGeneral()) this.loadCurrentCutoff();
  }
  canNotify(): boolean {
    return this.has('notifications.view_own');
  }
  canReports(): boolean {
    return this.any(['reports.view_branch', 'reports.view_global']);
  }
  isGerenteGeneral(): boolean {
    return this.has('reports.view_global'); // Using the same permission as reports global for Gerente General scope
  }

  readonly cutoffSummary = signal<import('./centro-operacion-api.service').CurrentCutoffSummary | null>(null);
  readonly cutoffState = signal<'OPEN' | 'PROCESANDO' | 'CLOSED'>('OPEN');
  readonly showForceCutoffModal = signal(false);
  readonly closedProcessId = signal<string | null>(null);
  readonly cutoffError = signal<string | null>(null);
  cutoffMotivo = '';

  loadCurrentCutoff(): void {
    this.api.getCurrentCutoffSummary().subscribe({
      next: (summary) => this.cutoffSummary.set(summary),
      error: () => this.cutoffError.set('Error cargando el resumen del corte.')
    });
  }

  openForceCutoffModal(): void {
    this.showForceCutoffModal.set(true);
    this.cutoffMotivo = '';
    this.cutoffError.set(null);
  }

  closeForceCutoffModal(): void {
    this.showForceCutoffModal.set(false);
  }

  executeForceCutoff(): void {
    this.cutoffState.set('PROCESANDO');
    this.cutoffError.set(null);
    const idempotencyKey = crypto.randomUUID();

    this.api.forceCutoff(this.cutoffMotivo, idempotencyKey).subscribe({
      next: (response) => {
        this.cutoffState.set('CLOSED');
        this.closedProcessId.set(response.process_run_id);
        this.showForceCutoffModal.set(false);
      },
      error: (err) => {
        this.cutoffState.set('OPEN');
        this.cutoffError.set(err.error?.message || 'Error desconocido al procesar el cierre.');
      }
    });
  }

  canAudit(): boolean {
    return this.any(['audit.view_branch', 'audit.view_global']);
  }
  canLogs(): boolean {
    return this.any(['logs.view_branch', 'logs.view_global']);
  }
  loadNotifications(): void {
    this.api.notifications(this.unreadOnly).subscribe((page) => this.notifications.set(page.data));
  }
  mark(item: NotificationItem): void {
    this.api.markRead(item.id).subscribe(() => {
      this.loadNotifications();
      this.api.unreadCount().subscribe((count) => this.unreadCount.set(count));
    });
  }
  open(item: NotificationItem): void {
    this.mark(item);
    void this.router.navigateByUrl(item.data.deep_link);
  }
  runReport(): void {
    if (!this.selectedReport) return;
    const filters: Record<string, string> = {};
    if (this.dateFrom) filters['date_from'] = this.dateFrom;
    if (this.dateTo) filters['date_to'] = this.dateTo;
    if (this.status) filters['status'] = this.status;
    this.api
      .report(this.selectedReport, filters)
      .subscribe((page) => this.reportRows.set(page.data));
  }
  loadAudits(): void {
    this.api.audits({}).subscribe((page) => this.audits.set(page.data));
  }
  loadLogs(): void {
    this.api
      .logs(this.correlationId ? { correlation_id: this.correlationId } : {})
      .subscribe((page) => this.logs.set(page.data));
  }
  private has(permission: string): boolean {
    return this.session.permissions().includes(permission);
  }
  private any(permissions: string[]): boolean {
    return permissions.some((permission) => this.has(permission));
  }

  puntosCorteAt = '';
  isExportingPuntos = false;

  presolStatus = 'TODOS';
  presolFrom = '';
  presolTo = '';
  isExportingPresol = false;

  private cdr = inject(ChangeDetectorRef);

  descargarPuntos(): void {
    this.isExportingPuntos = true;
    this.api.exportPuntosBalance(this.puntosCorteAt).subscribe({
      next: (blob) => {
        const timestamp = new Date().toISOString().split('T')[0];
        const dateStr = this.puntosCorteAt ? `_corte_${this.puntosCorteAt}` : `_reporte_${timestamp}`;
        this.downloadBlob(blob, `saldo_puntos${dateStr}.xlsx`);
        this.isExportingPuntos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isExportingPuntos = false;
        this.cdr.detectChanges();
      }
    });
  }

  descargarPresolicitudes(): void {
    this.isExportingPresol = true;
    this.api.exportPreRequests(this.presolStatus, this.presolFrom, this.presolTo).subscribe({
      next: (blob) => {
        const timestamp = new Date().toISOString().split('T')[0];
        let name = `presolicitudes_${this.presolStatus.toLowerCase()}`;
        if (this.presolFrom) name += `_desde_${this.presolFrom}`;
        if (this.presolTo) name += `_hasta_${this.presolTo}`;
        if (!this.presolFrom && !this.presolTo) name += `_${timestamp}`;
        this.downloadBlob(blob, `${name}.xlsx`);
        this.isExportingPresol = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isExportingPresol = false;
        this.cdr.detectChanges();
      }
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
