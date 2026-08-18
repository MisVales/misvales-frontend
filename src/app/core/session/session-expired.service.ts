import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionExpiredService {
  private readonly openState = signal(false);

  readonly isOpen = this.openState.asReadonly();

  open(): boolean {
    if (this.openState()) {
      return false;
    }

    this.openState.set(true);
    return true;
  }

  close(): void {
    this.openState.set(false);
  }
}
