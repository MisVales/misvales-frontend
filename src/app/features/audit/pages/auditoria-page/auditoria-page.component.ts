import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  ACTION_LABELS_ES,
  AuditoriaApiService,
  AuditActionGroup,
  AuditFilters,
  AuditFilterOptions,
  AuditRecord,
  OperationalLog,
} from '../../data-access/auditoria-api.service';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

@Component({
  selector: 'app-auditoria-page',
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    JsonPipe,
    LucideAngularModule,
    RefactorSelectComponent,
  ],
  templateUrl: './auditoria-page.component.html',
  styleUrl: './auditoria-page.component.css',
})
export class AuditoriaPageComponent implements OnInit {
  readonly api = inject(AuditoriaApiService);

  readonly audits = signal<AuditRecord[]>([]);
  readonly operationalLogs = signal<OperationalLog[]>([]);
  readonly filterOptions = signal<AuditFilterOptions>({ events: [], actor_roles: [], results: [] });
  readonly activeView = signal<'events' | 'requests'>('events');
  readonly isLoading = signal<boolean>(false);
  readonly loadError = signal<string>('');

  // Pagination
  readonly currentPage = signal<number>(1);
  readonly lastPage = signal<number>(1);
  readonly totalItems = signal<number>(0);

  // Filters
  searchTerm = '';
  actionFilter: AuditActionGroup | '' = '';
  moduleFilter = '';
  eventNameFilter = '';
  roleFilter = '';
  resultFilter = '';
  dateFrom = '';
  dateTo = '';
  logChannelFilter = '';
  logLevelFilter = '';
  logStatusFilter = '';

  // Inspector Modal
  readonly selectedAudit = signal<AuditRecord | null>(null);
  readonly detailTab = signal<'summary' | 'changes' | 'tech'>('summary');

  // KPI Computeds
  readonly successCount = computed(() => {
    return this.audits().filter((a) => a.result === 'SUCCESS').length;
  });

  readonly failureCount = computed(() => {
    return this.audits().filter((a) => a.result !== 'SUCCESS').length;
  });

  readonly operationalSuccessCount = computed(() => {
    return this.operationalLogs().filter((log) => {
      const status = log.status_code ?? 0;
      return status >= 200 && status < 400;
    }).length;
  });

  readonly operationalFailureCount = computed(() => {
    return this.operationalLogs().filter((log) => (log.status_code ?? 0) >= 400).length;
  });

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadAudits(1);
  }

  get actionOptions(): { value: AuditActionGroup; label: string }[] {
    const available = new Set(
      this.filterOptions().events.map((event) => this.api.getActionGroup(event.event_name)),
    );
    return (Object.entries(ACTION_LABELS_ES) as [AuditActionGroup, string][])
      .filter(([value]) => available.has(value))
      .map(([value, label]) => ({ value, label }));
  }

  get moduleOptions(): { value: string; label: string }[] {
    const modules = new Set(
      this.filterOptions()
        .events.map((event) => event.entity_type)
        .filter((value): value is string => Boolean(value)),
    );
    return [...modules]
      .map((value) => ({ value, label: this.api.getEntityLabel(value) }))
      .sort((left, right) => left.label.localeCompare(right.label, 'es'));
  }

  get eventOptions(): { value: string; label: string }[] {
    const events = this.filterOptions().events.filter((event) => {
      const matchesAction =
        !this.actionFilter || this.api.getActionGroup(event.event_name) === this.actionFilter;
      const matchesModule = !this.moduleFilter || event.entity_type === this.moduleFilter;
      return matchesAction && matchesModule;
    });
    return [...new Set(events.map((event) => event.event_name))]
      .map((value) => ({ value, label: this.api.getEventInfo(value).label }))
      .sort((left, right) => left.label.localeCompare(right.label, 'es'));
  }

  loadFilterOptions(): void {
    this.api.getFilterOptions().subscribe({
      next: (options) => this.filterOptions.set(options),
      error: () => {
        this.loadError.set(
          'No fue posible cargar todos los filtros de auditoría. Inténtalo nuevamente.',
        );
      },
    });
  }

  loadAudits(page = 1): void {
    this.isLoading.set(true);
    this.loadError.set('');
    const filters: AuditFilters = {
      page,
      per_page: 25,
      search: this.searchTerm.trim() || undefined,
      event_name: this.eventNameFilter || undefined,
      event_names:
        !this.eventNameFilter && this.actionFilter
          ? this.filterOptions()
              .events.filter(
                (event) =>
                  this.api.getActionGroup(event.event_name) === this.actionFilter &&
                  (!this.moduleFilter || event.entity_type === this.moduleFilter),
              )
              .map((event) => event.event_name)
          : undefined,
      entity_type: this.moduleFilter || undefined,
      actor_role: this.roleFilter || undefined,
      result: this.resultFilter || undefined,
      date_from: this.dateFrom || undefined,
      date_to: this.dateTo || undefined,
    };

    this.api.getAudits(filters).subscribe({
      next: (res) => {
        this.audits.set(res.data);
        this.currentPage.set(res.current_page);
        this.lastPage.set(res.last_page);
        this.totalItems.set(res.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set(
          'No fue posible cargar la auditoría. Conserva el folio de soporte e inténtalo nuevamente.',
        );
      },
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.actionFilter = '';
    this.moduleFilter = '';
    this.eventNameFilter = '';
    this.roleFilter = '';
    this.resultFilter = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.loadAudits(1);
  }

  filtersChanged(): void {
    if (
      this.eventNameFilter &&
      !this.eventOptions.some((option) => option.value === this.eventNameFilter)
    ) {
      this.eventNameFilter = '';
    }
    this.loadAudits(1);
  }

  switchView(view: 'events' | 'requests'): void {
    this.activeView.set(view);
    this.loadError.set('');
    if (view === 'requests' && this.operationalLogs().length === 0) {
      this.loadOperationalLogs(1);
    }
  }

  refreshActiveView(): void {
    if (this.activeView() === 'events') {
      this.loadAudits(this.currentPage());
      return;
    }
    this.loadOperationalLogs(this.currentPage());
  }

  loadPage(page: number): void {
    if (this.activeView() === 'events') {
      this.loadAudits(page);
      return;
    }
    this.loadOperationalLogs(page);
  }

  loadOperationalLogs(page = 1): void {
    this.isLoading.set(true);
    this.loadError.set('');
    this.api
      .getOperationalLogs({
        page,
        per_page: 25,
        search: this.searchTerm.trim() || undefined,
        channel: this.logChannelFilter || undefined,
        level: this.logLevelFilter || undefined,
        status_code: this.logStatusFilter ? Number(this.logStatusFilter) : undefined,
        date_from: this.dateFrom || undefined,
        date_to: this.dateTo || undefined,
      })
      .subscribe({
        next: (res) => {
          this.operationalLogs.set(res.data);
          this.currentPage.set(res.current_page);
          this.lastPage.set(res.last_page);
          this.totalItems.set(res.total);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set(
            'No fue posible cargar las trazas de solicitudes. Conserva el folio de soporte e inténtalo nuevamente.',
          );
        },
      });
  }

  resetOperationalFilters(): void {
    this.searchTerm = '';
    this.logChannelFilter = '';
    this.logLevelFilter = '';
    this.logStatusFilter = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.loadOperationalLogs(1);
  }

  openDetailModal(audit: AuditRecord): void {
    this.selectedAudit.set(audit);
    this.detailTab.set('summary');
  }

  closeDetailModal(): void {
    this.selectedAudit.set(null);
  }

  copyToClipboard(text: string): void {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
  }

  hasKeys(obj: unknown): boolean {
    return typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0;
  }
}
