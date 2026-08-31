import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  duration: number;
  closing: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  readonly alerts = signal<Alert[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  private sequence = 0;

  success(message: unknown, duration = 5000): void {
    this.showAlert(message, 'success', duration);
  }

  error(message: unknown, duration = 8000): void { this.showAlert(message, 'error', duration); }
  warning(message: unknown, duration = 6500): void { this.showAlert(message, 'warning', duration); }
  info(message: unknown, duration = 5500): void { this.showAlert(message, 'info', duration); }

  showAlert(message: unknown, type: AlertType = 'info', duration = this.defaultDuration(type)): void {
    const normalized = this.normalizeMessage(message);
    if (!normalized) return;
    const duplicate = this.alerts().find(alert => alert.message === normalized && alert.type === type);
    if (duplicate) this.removeAlert(duplicate.id, true);
    const id = `alert-${Date.now()}-${++this.sequence}`;
    const alert: Alert = { id, type, message: normalized, duration, closing: false };
    this.alerts.update(current => {
      const evicted = current.slice(0, -3);
      evicted.forEach(item => {
        const timer = this.timers.get(item.id);
        if (timer) clearTimeout(timer);
        this.timers.delete(item.id);
      });
      return [...current.slice(-3), alert];
    });

    if (duration > 0) {
      this.timers.set(id, setTimeout(() => this.removeAlert(id), duration));
    }
  }

  removeAlert(id: string, immediately = false): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    if (immediately) {
      this.alerts.update(current => current.filter(alert => alert.id !== id));
      return;
    }
    this.alerts.update(current => current.map(alert => alert.id === id ? { ...alert, closing: true } : alert));
    setTimeout(() => this.alerts.update(current => current.filter(alert => alert.id !== id)), 220);
  }

  clear(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.alerts.set([]);
  }

  private defaultDuration(type: AlertType): number {
    return ({ success: 4500, info: 5500, warning: 6500, error: 8000 })[type];
  }

  private normalizeMessage(value: unknown): string {
    if (typeof value === 'string') return value.trim();
    if (value instanceof Error) return value.message.trim();
    if (!value || typeof value !== 'object') return '';

    const record = value as Record<string, unknown>;
    const nestedError = record['error'];
    const candidates = [
      record['message'],
      record['detail'],
      nestedError && typeof nestedError === 'object'
        ? (nestedError as Record<string, unknown>)['message']
        : undefined,
    ];
    const message = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim());
    return typeof message === 'string' ? message.trim() : '';
  }
}
