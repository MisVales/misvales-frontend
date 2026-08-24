import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RequestCorrelationService {
  private readonly activeCorrelationId = signal(crypto.randomUUID());

  correlationId(): string {
    return this.activeCorrelationId();
  }

  nextRequestId(): string {
    return crypto.randomUUID();
  }

  beginActivity(): void {
    this.activeCorrelationId.set(crypto.randomUUID());
  }
}
