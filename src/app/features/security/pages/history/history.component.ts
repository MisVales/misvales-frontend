import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { SecurityEventRes, SecurityService } from '../../data-access/security.service';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { securityEventLabel, securityOutcomeLabel } from '../../utils/security-event-labels';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DatePipe, ReactiveFormsModule],
  templateUrl: './history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent implements OnInit {
  readonly eventLabel = securityEventLabel;
  readonly outcomeLabel = securityOutcomeLabel;
  private securityService = inject(SecurityService);
  private fb = inject(FormBuilder);

  events = signal<SecurityEventRes[]>([]);
  loading = signal(true);
  error = signal('');
  
  filterForm = this.fb.group({
    severity: ['']
  });

  async ngOnInit() {
    await this.loadEvents();
    
    this.filterForm.valueChanges.subscribe(() => {
      this.loadEvents();
    });
  }

  async loadEvents() {
    this.loading.set(true);
    this.error.set('');
    try {
      const severity = this.filterForm.controls.severity.value;
      const filters = { severity: severity || undefined };
      const response = await firstValueFrom(this.securityService.getSecurityEvents(filters));
      this.events.set(response.data);
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No se pudo cargar el historial de eventos.'));
    } finally {
      this.loading.set(false);
    }
  }

  getIconForSeverity(severity: string): string {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'octagon-alert';
      case 'WARNING': return 'alert-triangle';
      case 'INFO': return 'info';
      default: return 'activity';
    }
  }

  getColorForSeverity(severity: string): string {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      case 'WARNING': return 'text-yellow-600 bg-yellow-50';
      case 'INFO': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }
}
