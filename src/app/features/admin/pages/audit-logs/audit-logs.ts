import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { SecurityEventRes, SecurityService } from '../../../security/data-access/security.service';
import {
  securityEventLabel,
  securityOutcomeLabel,
} from '../../../security/utils/security-event-labels';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DatePipe, RefactorSelectComponent],
  templateUrl: './audit-logs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogs implements OnInit {
  readonly eventLabel = securityEventLabel;
  readonly outcomeLabel = securityOutcomeLabel;
  private readonly securityService = inject(SecurityService);

  readonly events = signal<SecurityEventRes[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  readonly totalItems = signal(0);
  readonly eventTypeFilter = signal('');

  async ngOnInit(): Promise<void> {
    await this.loadEvents();
  }

  async loadEvents(page = 1): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await firstValueFrom(
        this.securityService.getSecurityEvents({
          page,
          event_type: this.eventTypeFilter() || undefined,
        }),
      );
      this.events.set(response.data);
      this.currentPage.set(response.current_page);
      this.lastPage.set(response.last_page);
      this.totalItems.set(response.total);
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible cargar la auditoría de seguridad.'));
    } finally {
      this.loading.set(false);
    }
  }

  async setPage(page: number): Promise<void> {
    if (page >= 1 && page <= this.lastPage()) await this.loadEvents(page);
  }

  async filterByEvent(): Promise<void> {
    await this.loadEvents(1);
  }
}
