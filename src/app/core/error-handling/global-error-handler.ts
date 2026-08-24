import { ErrorHandler, Injectable, inject, isDevMode } from '@angular/core';
import { AlertService } from '@shared/components/alerts/alert.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly alerts = inject(AlertService);

  handleError(error: unknown): void {
    if (isDevMode()) {
      console.error('GLOBAL ERROR:', error);
      return;
    }

    this.alerts.showAlert('No fue posible completar la acción. Intenta nuevamente.', 'error', 7000);
  }
}
