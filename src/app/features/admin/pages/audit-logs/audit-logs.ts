import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { API_CONFIG } from '../../../../core/api/api.config';
import { firstValueFrom } from 'rxjs';

interface SecurityEvent {
  id: string;
  event_type: string;
  user_id: string;
  ip_address: string;
  description: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DatePipe],
  templateUrl: './audit-logs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogs implements OnInit {
  private http = inject(HttpClient);
  private config = inject(API_CONFIG);

  events = signal<SecurityEvent[]>([]);
  loading = signal(true);
  error = signal('');
  
  currentPage = signal(1);
  lastPage = signal(1);
  totalItems = signal(0);
  
  eventTypeFilter = signal<string>('');

  async ngOnInit() {
    await this.loadEvents();
  }

  async loadEvents(page: number = 1) {
    this.loading.set(true);
    this.error.set('');
    try {
      const params: any = { page: page.toString() };
      if (this.eventTypeFilter()) {
        params.event_type = this.eventTypeFilter();
      }

      const response = await firstValueFrom(
        this.http.get<PaginatedResponse<SecurityEvent>>(`${this.config.baseUrl}/api/v1/security-events`, { params })
      );
      this.events.set(response.data);
      this.currentPage.set(response.meta.current_page);
      this.lastPage.set(response.meta.last_page);
      this.totalItems.set(response.meta.total);
    } catch (err: any) {
      this.error.set('Error al cargar la auditoría de seguridad.');
    } finally {
      this.loading.set(false);
    }
  }

  async setPage(page: number) {
    if (page >= 1 && page <= this.lastPage()) {
      await this.loadEvents(page);
    }
  }

  async filterByEvent() {
    await this.loadEvents(1);
  }
}
