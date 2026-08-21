import { CommonModule } from '@angular/common';
import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionStore } from '../../core/session/session.store';
import {
  CentroOperacionApiService,
  NotificationItem,
} from './centro-operacion-api.service';

@Component({
  selector: 'app-centro-operacion-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: ` <section class="space-y-6 p-4 md:p-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Centro de operación</h1>
        <p class="text-sm text-gray-600">
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
      <section>
        <div class="flex items-center gap-3">
          <h2 class="font-bold">Notificaciones</h2>
          <label class="text-sm"
            ><input type="checkbox" [(ngModel)]="unreadOnly" (change)="loadNotifications()" /> Solo
            no leídas</label
          >
        </div>
        <div class="mt-3 grid gap-2">
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
      <section class="space-y-4 mb-8">
        <h2 class="font-bold">Reportes Excel Especiales</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-xl border bg-white p-4">
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
        <div class="rounded-xl border bg-white p-4">
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

      <section class="space-y-3">
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
    @if (canAudit()) {
      <section class="space-y-3">
        <h2 class="font-bold">Auditoría inmutable</h2>
        <button class="rounded border px-3 py-2" (click)="loadAudits()">Consultar auditoría</button>
        @for (row of audits(); track $index) {
          <pre class="overflow-x-auto rounded border bg-white p-3 text-xs">{{ row | json }}</pre>
        }
      </section>
    }
    @if (canLogs()) {
      <section class="space-y-3">
        <h2 class="font-bold">Logs estructurados</h2>
        <div class="flex gap-2">
          <input
            class="rounded border p-2"
            [(ngModel)]="correlationId"
            placeholder="Correlation ID"
          /><button class="rounded border px-3 py-2" (click)="loadLogs()">Buscar</button>
        </div>
        @for (row of logs(); track $index) {
          <pre class="overflow-x-auto rounded border bg-white p-3 text-xs">{{ row | json }}</pre>
        }
      </section>
    }
  </section>`,
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
  }
  canNotify(): boolean {
    return this.has('notifications.view_own');
  }
  canReports(): boolean {
    return this.any(['reports.view_branch', 'reports.view_global']);
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
