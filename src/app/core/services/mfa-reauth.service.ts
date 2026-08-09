import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MfaReauthService {
  readonly isModalOpen = signal(false);

  private pendingPromise: Promise<string> | null = null;
  private resolvePending: ((code: string) => void) | null = null;
  private rejectPending: ((reason: Error) => void) | null = null;

  requestMfaCode(): Promise<string> {
    if (this.pendingPromise) {
      return this.pendingPromise;
    }

    this.isModalOpen.set(true);
    this.pendingPromise = new Promise<string>((resolve, reject) => {
      this.resolvePending = resolve;
      this.rejectPending = reject;
    }).finally(() => this.reset());

    return this.pendingPromise;
  }

  submitCode(code: string): void {
    if (/^\d{6}$/.test(code)) {
      this.resolvePending?.(code);
    }
  }

  cancel(): void {
    this.rejectPending?.(new Error('MFA_REAUTH_CANCELLED'));
  }

  private reset(): void {
    this.isModalOpen.set(false);
    this.pendingPromise = null;
    this.resolvePending = null;
    this.rejectPending = null;
  }
}
