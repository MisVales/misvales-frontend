import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { UiStateComponent, UiStateKind } from './ui-state.component';

@Component({
  selector: 'mv-technical-state-page',
  imports: [RouterLink, UiStateComponent],
  template: `
    <main>
      <mv-ui-state [kind]="kind" [message]="message" />
      <a routerLink="/acceso">Volver a acceso</a>
    </main>
  `,
  styles: `
    main {
      display: grid;
      min-height: 100vh;
      place-content: center;
      gap: 1rem;
      padding: 1rem;
    }
    a {
      min-height: 44px;
      color: var(--mv-green-dark);
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnicalStatePageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly kind = this.route.snapshot.data['kind'] as UiStateKind;
  readonly message = this.route.snapshot.data['message'] as string | null;
}
