import { computed, inject, Injectable, signal } from '@angular/core';
import { SessionStore } from '@core/session/session.store';
import { DeviceExperienceService } from './device-experience.service';
import { evaluateExperiencePolicy } from './experience-policy';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExperiencePolicyService {
  private readonly sessionStore = inject(SessionStore);
  private readonly deviceExperience = inject(DeviceExperienceService);

  readonly decision = computed(
    () => {
      const decision = evaluateExperiencePolicy(
        this.sessionStore.roles(),
        this.deviceExperience.context(),
      );

      // En desarrollo local se conserva el layout asignado al rol, pero no se
      // bloquea la cuenta por el dispositivo físico desde el que se prueba.
      if (!environment.production && decision.kind === 'unsupported') {
        return {
          kind: 'allowed' as const,
          requiredExperience: decision.requiredExperience,
          device: decision.device,
        };
      }

      return decision;
    },
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
