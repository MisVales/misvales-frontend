import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionStore } from '../../core/session/session.store';
import {
  CentroOperacionApiService,
  NotificationItem,
  ReadinessStatus,
} from './centro-operacion-api.service';

@Component({
  selector: 'app-centro-operacion-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: ` <section class="space-y-6 p-4 md:p-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase text-gray-500">M18</p>
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
    <section class="rounded-xl border bg-white p-4" aria-live="polite">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="font-bold">Disponibilidad operativa</h2>
          <p class="text-sm text-gray-600">PostgreSQL, Redis, almacenamiento privado y scheduler.</p>
        </div>
        <button class="rounded border px-3 py-2" (click)="loadReadiness()">Actualizar</button>
      </div>
      @if (readiness(); as health) {
        <p class="mt-3 font-semibold" [class.text-green-700]="health.status === 'ready'" [class.text-red-700]="health.status !== 'ready'">
          {{ health.status === 'ready' ? 'Operación disponible' : 'Operación no disponible' }}
        </p>
        <ul class="mt-2 grid gap-1 text-sm sm:grid-cols-2 lg:grid-cols-4">
          @for (check of health.checks | keyvalue; track check.key) {
            <li>{{ check.key }}: {{ check.value ? 'correcto' : 'fallando' }}</li>
          }
        </ul>
        <p class="mt-2 text-xs text-gray-500">Jobs fallidos: {{ health.failed_jobs }} · Verificado: {{ health.checked_at | date: 'short' }}</p>
      } @else {
        <p class="mt-3 text-sm text-gray-500">Estado operativo no disponible.</p>
      }
    </section>
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
  readonly readiness = signal<ReadinessStatus | null>(null);
  unreadOnly = false;
  selectedReport = '';
  dateFrom = '';
  dateTo = '';
  status = '';
  correlationId = '';
  constructor() {
    this.loadReadiness();
    if (this.canNotify()) {
      this.loadNotifications();
      this.api.unreadCount().subscribe((count) => this.unreadCount.set(count));
    }
    if (this.canReports()) this.api.reports().subscribe((reports) => this.reports.set(reports));
  }
  loadReadiness(): void {
    this.api.readiness().subscribe({
      next: (health) => this.readiness.set(health),
      error: (response) => this.readiness.set(response.error ?? null),
    });
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
}
