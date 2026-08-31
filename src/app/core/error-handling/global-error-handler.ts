import { ErrorHandler, Injectable, inject, isDevMode } from '@angular/core';
import { AlertService } from '@shared/components/alerts/alert.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly alerts = inject(AlertService);

  handleError(error: unknown): void {
    const technicalError = this.technicalError(error);
    // Keep a production-safe breadcrumb so render failures can be correlated
    // with the browser/session logs without exposing arbitrary error objects.
    console.error('[MisVales GlobalError]', technicalError);

    if (isDevMode()) {
      return;
    }

    this.alerts.showAlert('No fue posible completar la acción. Intenta nuevamente.', 'error', 7000);
  }

  private technicalError(error: unknown): { name: string; message: string; stack?: string } {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        ...(error.stack ? { stack: error.stack } : {}),
      };
    }

    return {
      name: 'UnknownError',
      message: typeof error === 'string' ? error : 'Unhandled global error',
    };
  }
}
