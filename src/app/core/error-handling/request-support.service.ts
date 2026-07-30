import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RequestSupportService {
  readonly lastRequestId = signal<string | null>(null);
  readonly blockedUntil = signal<number | null>(null);

  captureRequestId(requestId: string | null): void {
    if (requestId) {
      this.lastRequestId.set(requestId);
    }
  }

  blockFor(seconds: number | null): void {
    this.blockedUntil.set(seconds === null ? null : Date.now() + seconds * 1000);
  }
}
