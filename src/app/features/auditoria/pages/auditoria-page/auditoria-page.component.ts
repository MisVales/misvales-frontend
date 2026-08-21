import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  AuditoriaApiService,
  AuditFilters,
  AuditRecord,
} from '../../data-access/auditoria-api.service';

@Component({
  selector: 'app-auditoria-page',
  imports: [CommonModule, FormsModule, DatePipe, JsonPipe, LucideAngularModule],
  templateUrl: './auditoria-page.component.html',
  styleUrl: './auditoria-page.component.css',
})
export class AuditoriaPageComponent implements OnInit {
  readonly api = inject(AuditoriaApiService);

  readonly audits = signal<AuditRecord[]>([]);
  readonly isLoading = signal<boolean>(false);

  // Pagination
  readonly currentPage = signal<number>(1);
  readonly lastPage = signal<number>(1);
  readonly totalItems = signal<number>(0);

  // Filters
  searchTerm = '';
  eventNameFilter = '';
  roleFilter = '';
  resultFilter = '';
  dateFrom = '';
  dateTo = '';

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

  ngOnInit(): void {
    this.loadAudits(1);
  }

  loadAudits(page = 1): void {
    this.isLoading.set(true);
    const filters: AuditFilters = {
      page,
      per_page: 25,
      search: this.searchTerm.trim() || undefined,
      event_name: this.eventNameFilter || undefined,
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
      },
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.eventNameFilter = '';
    this.roleFilter = '';
    this.resultFilter = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.loadAudits(1);
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
