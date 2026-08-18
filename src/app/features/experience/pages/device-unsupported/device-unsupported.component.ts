import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthFacade } from '../../../auth/state/auth.facade';
import { DeviceExperienceService } from '../../../../core/experience/device-experience.service';
import { ExperiencePolicyService } from '../../../../core/experience/experience-policy.service';

@Component({
  selector: 'app-device-unsupported',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <main class="device-page" tabindex="-1">
      <section class="device-card" aria-labelledby="device-title">
        <lucide-icon name="monitor-smartphone" [size]="42" aria-hidden="true" />
        <h1 id="device-title">Este dispositivo no es compatible</h1>
        <p>Tu rol requiere la experiencia de {{ requiredExperience() }}. Cambia a un dispositivo compatible o ajusta la ventana y vuelve a intentar.</p>
        <p class="sr-only" aria-live="polite">{{ announcement() }}</p>
        <div class="actions">
          <button type="button" (click)="retry()">Reintentar</button>
          <button type="button" class="secondary" (click)="logout()">Cerrar sesión</button>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host { display:block; min-height:100dvh; background:var(--mv-canvas); } .device-page { min-height:100dvh; display:grid; place-items:center; padding:24px; }
    .device-card { width:min(100%, 560px); padding:32px; border:1px solid var(--mv-border); border-radius:16px; background:var(--mv-surface); text-align:center; }
    h1 { margin:16px 0 8px; } p { color:var(--mv-text-muted); line-height:1.5; } .actions { display:flex; justify-content:center; gap:12px; margin-top:24px; }
    button { min-height:44px; padding:0 18px; border:0; border-radius:8px; background:var(--mv-primary); color:#fff; font:inherit; } .secondary { background:transparent; color:var(--mv-text); border:1px solid var(--mv-border); }
  `],
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
    return decision.kind === 'unsupported' ? label(decision.requiredExperience) : 'tu experiencia asignada';
  };

  constructor() {
    afterNextRender(() => document.querySelector<HTMLElement>('.device-page')?.focus());
  }

  retry(): void {
    this.device.refresh();
    if (this.policy.decision().kind === 'allowed') {
      this.announcement.set('Dispositivo compatible. Restaurando la página solicitada.');
      void this.router.navigateByUrl(this.policy.consumeReturnUrl(), { replaceUrl: true });
      return;
    }
    this.announcement.set('El dispositivo sigue sin ser compatible.');
  }

  logout(): void { this.auth.logout(); }
}

function label(value: 'desktop' | 'tablet' | 'mobile'): string {
  return value === 'desktop' ? 'escritorio' : value === 'tablet' ? 'tableta' : 'móvil';
}
