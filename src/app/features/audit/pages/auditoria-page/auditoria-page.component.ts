import { DatePipe, JsonPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  ACTION_LABELS_ES,
  AuditActionGroup,
  AuditEventOption,
  AuditFilterOptions,
  AuditFilters,
  AuditRecord,
  AuditoriaApiService,
  ChangedFieldDetail,
  OperationalLog,
} from '../../data-access/auditoria-api.service';

export interface AuditRowViewModel {
  id: string;
  raw: AuditRecord;
  actorName: string;
  actorEmailOrRole: string;
  actorRoleBadge: string;
  isSuccess: boolean;
  eventLabel: string;
  eventIcon: string;
  eventBadgeColor: string;
  changes: ChangedFieldDetail[];
  changesPreview: ChangedFieldDetail[];
  totalChanges: number;
  folio: string;
  isRealFolio: boolean;
  entityLabel: string;
  entityId: string | number | null | undefined;
  createdAt: string;
}

@Component({
  selector: 'app-auditoria-page',
  standalone: true,
  imports: [DatePipe, JsonPipe, FormsModule, LucideAngularModule],
  templateUrl: './auditoria-page.component.html',
  styleUrl: './auditoria-page.component.css',
})
export class AuditoriaPageComponent implements OnInit {
  protected readonly api = inject(AuditoriaApiService);

  readonly audits = signal<AuditRecord[]>([]);
  readonly operationalLogs = signal<OperationalLog[]>([]);
  readonly filterOptions = signal<AuditFilterOptions>({
    events: [],
    actor_roles: [],
    results: [],
  });

  readonly selectedAudit = signal<AuditRecord | null>(null);
  readonly detailTab = signal<'summary' | 'changes' | 'tech'>('summary');
  readonly showRawJson = signal<boolean>(false);
  readonly copySuccess = signal<boolean>(false);

  readonly activeView = signal<'events' | 'requests'>('events');
  readonly isLoading = signal<boolean>(false);
  readonly loadError = signal<string>('');

  readonly currentPage = signal<number>(1);
  readonly lastPage = signal<number>(1);
  readonly totalItems = signal<number>(0);

  // Filtros interactivos
  searchTerm = '';
  actionFilter: AuditActionGroup | '' = '';
  moduleFilter = '';
  eventNameFilter = '';
  roleFilter = '';
  resultFilter = '';
  dateFrom = '';
  dateTo = '';

  // Filtros operativos
  logChannelFilter = '';
  logLevelFilter = '';
  logStatusFilter = '';

  // Computed row view models for instant synchronous rendering
  readonly auditRows = computed<AuditRowViewModel[]>(() => {
    const list = this.audits();
    if (!Array.isArray(list)) return [];

    return list.map((audit) => {
      const eventInfo = this.api.getEventInfo(audit.event_name);
      const changes = this.api.extractActualChanges(audit);
      const folioInfo = this.api.getEntityFolioOrIdentifier(audit);

      return {
        id: audit.id,
        raw: audit,
        actorName: audit.actor?.name || 'Usuario no disponible',
        actorEmailOrRole: audit.actor?.email || audit.actor_role,
        actorRoleBadge: this.api.getRoleLabel(audit.actor_role),
        isSuccess: audit.result === 'SUCCESS',
        eventLabel: eventInfo.label,
        eventIcon: eventInfo.icon,
        eventBadgeColor: eventInfo.badgeColor,
        changes,
        changesPreview: changes.slice(0, 3),
        totalChanges: changes.length,
        folio: folioInfo.folio,
        isRealFolio: folioInfo.isRealFolio,
        entityLabel: this.api.getEntityLabel(audit.entity_type || 'Sistema'),
        entityId: audit.entity_id ?? null,
        createdAt: audit.created_at,
      };
    });
  });

  // KPI Computeds
  readonly successCount = computed(() => {
    const list = this.audits();
    return Array.isArray(list) ? list.filter((a) => a.result === 'SUCCESS').length : 0;
  });

  readonly failureCount = computed(() => {
    const list = this.audits();
    return Array.isArray(list) ? list.filter((a) => a.result !== 'SUCCESS').length : 0;
  });

  readonly operationalSuccessCount = computed(() => {
    const list = this.operationalLogs();
    return Array.isArray(list)
      ? list.filter((log) => {
          const status = log.status_code ?? 0;
          return status >= 200 && status < 400;
        }).length
      : 0;
  });

  readonly operationalFailureCount = computed(() => {
    const list = this.operationalLogs();
    return Array.isArray(list) ? list.filter((log) => (log.status_code ?? 0) >= 400).length : 0;
  });

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadAudits(1);
  }

  get actionOptions(): { value: AuditActionGroup; label: string }[] {
    const events: AuditEventOption[] = this.filterOptions()?.events ?? [];
    const available = new Set(
      events.map((event) => this.api.getActionGroup(event.event_name)),
    );
    return (Object.entries(ACTION_LABELS_ES) as [AuditActionGroup, string][])
      .filter(([value]) => available.has(value))
      .map(([value, label]) => ({ value, label }));
  }

  get moduleOptions(): { value: string; label: string }[] {
    const events: AuditEventOption[] = this.filterOptions()?.events ?? [];
    const modules = new Set(
      events
        .map((event) => event.entity_type)
        .filter((value): value is string => Boolean(value)),
    );
    return [...modules]
      .map((value) => ({ value, label: this.api.getEntityLabel(value) }))
      .sort((left, right) => left.label.localeCompare(right.label, 'es'));
  }

  get eventOptions(): { value: string; label: string }[] {
    const allEvents: AuditEventOption[] = this.filterOptions()?.events ?? [];
    const events = allEvents.filter((event) => {
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
      next: (options) => {
        const opts = options && options.events ? options : { events: [], actor_roles: [], results: [] };
        this.filterOptions.set(opts);
      },
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
    const events: AuditEventOption[] = this.filterOptions()?.events ?? [];
    const filters: AuditFilters = {
      page,
      per_page: 25,
      search: this.searchTerm.trim() || undefined,
      event_name: this.eventNameFilter || undefined,
      event_names:
        !this.eventNameFilter && this.actionFilter
          ? events
              .filter(
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
      next: (res: any) => {
        let auditList: AuditRecord[] = [];
        let currentPage = page;
        let lastPage = 1;
        let total = 0;

        if (res) {
          if (Array.isArray(res.data)) {
            auditList = res.data;
            currentPage = res.current_page ?? page;
            lastPage = res.last_page ?? 1;
            total = res.total ?? auditList.length;
          } else if (Array.isArray(res)) {
            auditList = res;
            total = res.length;
          } else if (res.data && Array.isArray(res.data.data)) {
            auditList = res.data.data;
            currentPage = res.data.current_page ?? page;
            lastPage = res.data.last_page ?? 1;
            total = res.data.total ?? auditList.length;
          }
        }

        this.audits.set(auditList);
        this.currentPage.set(currentPage);
        this.lastPage.set(lastPage);
        this.totalItems.set(total);
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
        next: (res: any) => {
          let logList: OperationalLog[] = [];
          let currentPage = page;
          let lastPage = 1;
          let total = 0;

          if (res) {
            if (Array.isArray(res.data)) {
              logList = res.data;
              currentPage = res.current_page ?? page;
              lastPage = res.last_page ?? 1;
              total = res.total ?? logList.length;
            } else if (Array.isArray(res)) {
              logList = res;
              total = res.length;
            } else if (res.data && Array.isArray(res.data.data)) {
              logList = res.data.data;
              currentPage = res.data.current_page ?? page;
              lastPage = res.data.last_page ?? 1;
              total = res.data.total ?? logList.length;
            }
          }

          this.operationalLogs.set(logList);
          this.currentPage.set(currentPage);
          this.lastPage.set(lastPage);
          this.totalItems.set(total);
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

  // --- Inspector Modal Methods ---
  openDetailModal(audit: AuditRecord): void {
    this.selectedAudit.set(audit);
    this.detailTab.set('summary');
    this.showRawJson.set(false);
    this.copySuccess.set(false);
  }

  openJsonModal(audit: AuditRecord): void {
    this.selectedAudit.set(audit);
    this.detailTab.set('changes');
    this.showRawJson.set(true);
    this.copySuccess.set(false);
  }

  closeDetailModal(): void {
    this.selectedAudit.set(null);
    this.showRawJson.set(false);
    this.copySuccess.set(false);
  }

  toggleRawJson(): void {
    this.showRawJson.update((v) => !v);
  }

  copyToClipboard(text: string): void {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    }
  }

  copyJsonPayload(audit: AuditRecord): void {
    const payload = JSON.stringify(
      {
        id: audit.id,
        event_name: audit.event_name,
        entity_type: audit.entity_type,
        entity_id: audit.entity_id,
        actor: audit.actor,
        actor_role: audit.actor_role,
        branch: audit.branch,
        result: audit.result,
        reason: audit.reason,
        changes_detected: this.api.getChangedFields(audit),
        previous_values: audit.previous_value,
        new_values: audit.new_value,
        evidence: audit.evidence,
        created_at: audit.created_at,
        request_id: audit.request_id,
        trace_id: audit.trace_id,
        correlation_id: audit.correlation_id,
        ip_address: audit.ip_address,
        user_agent: audit.user_agent,
      },
      null,
      2,
    );
    this.copyToClipboard(payload);
  }

  hasKeys(obj: unknown): boolean {
    return typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0;
  }
}

