import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { classifyDevice } from './device-classifier';
import { DEVICE_SIGNAL_SOURCE } from './device-signal-source';
import type { DeviceContext } from './experience.models';
import { DEVICE_EVENT_DEBOUNCE_MS } from './experience.tokens';

@Injectable({ providedIn: 'root' })
export class DeviceExperienceService {
  private readonly source = inject(DEVICE_SIGNAL_SOURCE);
  private readonly destroyRef = inject(DestroyRef);
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly contextState = signal<DeviceContext>(classifyDevice(this.source.read()));

  readonly context = this.contextState.asReadonly();

  constructor() {
    const unsubscribe = this.source.subscribe(() => this.scheduleRefresh());
    this.destroyRef.onDestroy(() => {
      if (this.debounceTimer !== null) clearTimeout(this.debounceTimer);
      unsubscribe();
    });
  }

  refresh(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.updateContext();
  }

  private scheduleRefresh(): void {
    if (this.debounceTimer !== null) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this.updateContext();
    }, DEVICE_EVENT_DEBOUNCE_MS);
  }

  private updateContext(): void {
    const next = classifyDevice(this.source.read());
    if (!sameContext(this.contextState(), next)) this.contextState.set(next);
  }
}

function sameContext(left: DeviceContext, right: DeviceContext): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
