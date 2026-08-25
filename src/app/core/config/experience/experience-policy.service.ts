import { computed, inject, Injectable, signal } from '@angular/core';
import { SessionStore } from '@core/session/session.store';
import { DeviceExperienceService } from './device-experience.service';
import { evaluateExperiencePolicy } from './experience-policy';

@Injectable({ providedIn: 'root' })
export class ExperiencePolicyService {
  private readonly sessionStore = inject(SessionStore);
  private readonly deviceExperience = inject(DeviceExperienceService);

  readonly decision = computed(
    () => evaluateExperiencePolicy(this.sessionStore.roles(), this.deviceExperience.context()),
    {
      equal: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    },
  );

  private readonly returnUrlState = signal<string | null>(null);

  rememberReturnUrl(url: string): void {
    if (url.startsWith('/dispositivo-no-compatible') || url.startsWith('/acceso-denegado')) return;
    this.returnUrlState.set(url);
  }

  consumeReturnUrl(): string {
    const url = this.returnUrlState() ?? '/inicio';
    this.returnUrlState.set(null);
    return url;
  }
}
