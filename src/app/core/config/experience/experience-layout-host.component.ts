import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  type Type,
} from '@angular/core';
import { EXPERIENCE_LAYOUT_LOADER } from './experience-layout.loader';
import { ExperiencePolicyService } from './experience-policy.service';

@Component({
  selector: 'app-experience-layout-host',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    @if (layoutComponent(); as component) {
      <ng-container *ngComponentOutlet="component" />
    } @else {
      <div class="experience-loading" role="status" aria-live="polite">
        Actualizando vista de trabajo…
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
      min-height: 100dvh;
      background: var(--mv-canvas);
    }
    .experience-loading {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      color: var(--mv-text-muted);
      font-size: 0.9rem;
      font-weight: 650;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceLayoutHostComponent {
  private readonly policy = inject(ExperiencePolicyService);
  private readonly loadLayout = inject(EXPERIENCE_LAYOUT_LOADER);
  private loadVersion = 0;

  readonly layoutComponent = signal<Type<unknown> | null>(null);

  constructor() {
    effect(() => {
      const decision = this.policy.decision();
      const version = ++this.loadVersion;

      this.layoutComponent.set(null);
      if (decision.kind !== 'allowed') return;

      void this.loadLayout(decision.requiredExperience).then((component) => {
        if (version === this.loadVersion) this.layoutComponent.set(component);
      });
    });
  }
}
