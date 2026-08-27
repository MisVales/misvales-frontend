import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFacade } from '@core/auth/state/auth.facade';
import { DeviceExperienceService } from '@core/config/experience/device-experience.service';
import { ExperiencePolicyService } from '@core/config/experience/experience-policy.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-device-unsupported',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <main class="device-page" tabindex="-1">
      <section class="device-card" aria-labelledby="device-title">
        <span class="device-icon" aria-hidden="true">
          <lucide-icon name="monitor-smartphone" [size]="38" />
        </span>
        <p class="eyebrow">Dispositivo asignado</p>
        <h1 id="device-title">Entra desde el dispositivo que te indicaron</h1>
        <p class="message">
          Cuando crearon tu cuenta te indicaron que debes usar
          <strong>{{ requiredExperience() }}</strong>. Por seguridad y para mostrarte el layout
          correcto, esta cuenta no puede abrirse en este dispositivo.
        </p>
        <p class="hint">Cambia al dispositivo indicado y vuelve a iniciar sesión.</p>
        <p class="sr-only" aria-live="polite">{{ announcement() }}</p>
        <div class="actions">
          <button type="button" (click)="retry()">Volver a comprobar</button>
          <button type="button" class="secondary" (click)="logout()">Cerrar sesión</button>
        </div>
      </section>
    </main>
  `,
  styles: `
    :host { display: block; min-height: 100dvh; background: var(--mv-canvas); }
    .device-page { min-height: 100dvh; display: grid; place-items: center; padding: clamp(1rem, 4vw, 2.5rem); }
    .device-card { width: min(100%, 34rem); padding: clamp(1.5rem, 5vw, 2.75rem); border: 1px solid var(--mv-border); border-radius: 1.25rem; background: var(--mv-surface); box-shadow: var(--mv-shadow-card); text-align: center; }
    .device-icon { width: 4.5rem; height: 4.5rem; display: grid; place-items: center; margin: 0 auto 1rem; border-radius: 1.25rem; color: var(--mv-primary-700); background: var(--mv-primary-50); }
    .eyebrow { margin: 0 0 .35rem; color: var(--mv-primary-700); font-size: .75rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    h1 { margin: 0; font-size: clamp(1.6rem, 5vw, 2.2rem); line-height: 1.12; }
    .message { margin: 1rem auto 0; color: var(--mv-text-muted); line-height: 1.65; }
    .message strong { color: var(--mv-text); }
    .hint { margin: .75rem 0 0; color: var(--mv-text-muted); font-size: .88rem; }
    .actions { display: flex; justify-content: center; gap: .75rem; margin-top: 1.5rem; }
    button { min-height: 44px; padding: 0 1rem; border: 1px solid var(--mv-primary-700); border-radius: .65rem; background: var(--mv-primary-700); color: white; font: inherit; font-weight: 700; }
    button.secondary { border-color: var(--mv-border-strong); background: transparent; color: var(--mv-text); }
    @media (max-width: 30rem) { .actions { flex-direction: column; } .actions button { width: 100%; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceUnsupportedComponent {
  private readonly device = inject(DeviceExperienceService);
  private readonly policy = inject(ExperiencePolicyService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthFacade);

  readonly announcement = signal('');
  readonly requiredExperience = () => {
    const decision = this.policy.decision();
    return decision.kind === 'unsupported' ? experienceLabel(decision.requiredExperience) : 'el dispositivo asignado';
  };

  constructor() {
    afterNextRender(() => document.querySelector<HTMLElement>('.device-page')?.focus());
  }

  retry(): void {
    this.device.refresh();
    if (this.policy.decision().kind === 'allowed') {
      this.announcement.set('Dispositivo compatible. Abriendo la página solicitada.');
      void this.router.navigateByUrl(this.policy.consumeReturnUrl(), { replaceUrl: true });
      return;
    }
    this.announcement.set('Este todavía no es el dispositivo indicado para tu cuenta.');
  }

  logout(): void {
    this.auth.logout();
  }
}

function experienceLabel(value: 'desktop' | 'tablet' | 'mobile'): string {
  if (value === 'desktop') return 'una computadora';
  if (value === 'tablet') return 'una tableta';
  return 'un teléfono móvil';
}
