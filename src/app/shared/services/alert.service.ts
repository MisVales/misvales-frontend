import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  alerts = signal<Alert[]>([]);

  showAlert(message: string, type: AlertType = 'info', duration: number = 5000) {
    const id = Math.random().toString(36).substring(2, 9);
    const alert: Alert = { id, type, message, duration };
    
    this.alerts.update(current => [...current, alert]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeAlert(id);
      }, duration);
    }
  }

  removeAlert(id: string) {
    this.alerts.update(current => current.filter(a => a.id !== id));
  }
}
