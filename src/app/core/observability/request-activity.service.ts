import { Injectable, signal } from '@angular/core';

const SHOW_DELAY_MS = 160;
const MINIMUM_VISIBLE_MS = 240;

@Injectable({ providedIn: 'root' })
export class RequestActivityService {
  readonly pendingCount = signal(0);
  readonly visible = signal(false);

  private readonly activeTokens = new Set<number>();
  private nextToken = 0;
  private visibleSince = 0;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  begin(): () => void {
    const token = ++this.nextToken;
    this.activeTokens.add(token);
    this.pendingCount.set(this.activeTokens.size);

    if (this.activeTokens.size === 1) {
      this.cancelHide();
      this.showTimer = setTimeout(() => {
        this.showTimer = null;
        if (this.activeTokens.size > 0) {
          this.visibleSince = Date.now();
          this.visible.set(true);
        }
      }, SHOW_DELAY_MS);
    }

    let completed = false;
    return () => {
      if (completed) return;
      completed = true;
      this.finish(token);
    };
  }

  private finish(token: number): void {
    this.activeTokens.delete(token);
    this.pendingCount.set(this.activeTokens.size);
    if (this.activeTokens.size > 0) return;

    this.cancelShow();
    if (!this.visible()) return;

    const remaining = Math.max(0, MINIMUM_VISIBLE_MS - (Date.now() - this.visibleSince));
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      if (this.activeTokens.size === 0) {
        this.visible.set(false);
      }
    }, remaining);
  }

  private cancelShow(): void {
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private cancelHide(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
