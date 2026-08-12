import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../core/api/api.config';

export interface NotificationItem {
  id: string;
  data: { title: string; description: string; event_type: string; deep_link: string };
  read_at: string | null;
  created_at: string;
}
export interface Page<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CentroOperacionApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  notifications(unread = false): Observable<Page<NotificationItem>> {
    return this.http
      .get<{ data: Page<NotificationItem> }>(`${this.config.baseUrl}/notifications`, {
        params: { unread },
      })
      .pipe(map((response) => response.data));
  }
  unreadCount(): Observable<number> {
    return this.http
      .get<{ data: { count: number } }>(`${this.config.baseUrl}/notifications/unread-count`)
      .pipe(map((response) => response.data.count));
  }
  markRead(id: string): Observable<NotificationItem> {
    return this.http
      .patch<{ data: NotificationItem }>(`${this.config.baseUrl}/notifications/${id}/read`, {})
      .pipe(map((response) => response.data));
  }
  reports(): Observable<string[]> {
    return this.http
      .get<{ data: string[] }>(`${this.config.baseUrl}/reports`)
      .pipe(map((response) => response.data));
  }
  report(name: string, filters: Record<string, string>): Observable<Page<Record<string, unknown>>> {
    return this.http
      .get<{ data: Page<Record<string, unknown>> }>(`${this.config.baseUrl}/reports/${name}`, {
        params: filters,
      })
      .pipe(map((response) => response.data));
  }
  audits(filters: Record<string, string>): Observable<Page<Record<string, unknown>>> {
    return this.http
      .get<{ data: Page<Record<string, unknown>> }>(`${this.config.baseUrl}/audit-logs`, {
        params: filters,
      })
      .pipe(map((response) => response.data));
  }
  logs(filters: Record<string, string>): Observable<Page<Record<string, unknown>>> {
    return this.http
      .get<{ data: Page<Record<string, unknown>> }>(`${this.config.baseUrl}/operational-logs`, {
        params: filters,
      })
      .pipe(map((response) => response.data));
  }
}
