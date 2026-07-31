import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SessionStore } from '@core/session/session.store';

@Component({
  selector: 'mv-experience-home-page',
  imports: [RouterLink],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Inicio</p>
      <h1>Hola, {{ session.access()?.identity?.displayName || 'usuario' }}</h1>
      <p>Experiencia {{ session.access()?.experience }} · {{ session.access()?.role }}</p>
      <a [routerLink]="['/', session.access()?.experience, 'mi-cuenta', 'seguridad']">
        Abrir seguridad de mi cuenta
      </a>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceHomePageComponent {
  readonly session = inject(SessionStore);
}
