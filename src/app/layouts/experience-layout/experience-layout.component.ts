import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ExperiencePolicyService } from '../../core/experience/experience-policy.service';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';
import { TabletLayoutComponent } from '../tablet-layout/tablet-layout.component';
import { MobileLayoutComponent } from '../mobile-layout/mobile-layout.component';

@Component({
  selector: 'app-experience-layout',
  standalone: true,
  imports: [RouterOutlet, AdminLayoutComponent, TabletLayoutComponent, MobileLayoutComponent],
  template: `
    @switch (shell()) {
      @case ('desktop') { <app-admin-layout><router-outlet /></app-admin-layout> }
      @case ('tablet') { <app-tablet-layout><router-outlet /></app-tablet-layout> }
      @case ('mobile') { <app-mobile-layout><router-outlet /></app-mobile-layout> }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceLayoutComponent {
  readonly policy = inject(ExperiencePolicyService);
  private readonly router = inject(Router);
  readonly shell = computed(() => {
    const decision = this.policy.decision();
    return decision.kind === 'allowed' ? decision.requiredExperience : null;
  });

  constructor() {
    effect(() => {
      const decision = this.policy.decision();
      if (decision.kind === 'allowed') return;
      const target = decision.kind === 'denied' ? '/acceso-denegado' : '/dispositivo-no-compatible';
      if (this.router.url !== target) void this.router.navigateByUrl(target, { replaceUrl: true });
    });
  }
}
