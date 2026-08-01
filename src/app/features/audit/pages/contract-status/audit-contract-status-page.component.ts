import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { UiStateComponent } from '@shared/components/ui-state.component';

@Component({
  selector: 'mv-audit-contract-status-page',
  imports: [RouterLink, UiStateComponent],
  template: `
    <article class="contract-page">
      <p class="stage">Etapa 9 · {{ code }}</p>
      <mv-ui-state kind="error" [title]="title" [message]="message" [retryable]="false" />
      <section aria-labelledby="available-heading">
        <h2 id="available-heading">Integración disponible</h2>
        <p>
          La lista y el detalle usan exclusivamente los endpoints de auditoría de solo lectura. Los
          identificadores técnicos inequívocos se conservan sin transformación.
        </p>
      </section>
      <section aria-labelledby="blocked-heading">
        <h2 id="blocked-heading">Presentación bloqueada de forma segura</h2>
        <p>{{ blocker }}</p>
      </section>
      <a routerLink="/administrativa">Volver a una ruta segura</a>
    </article>
  `,
  styles: `
    .contract-page {
      display: grid;
      gap: 1rem;
      width: min(100%, 54rem);
      margin-inline: auto;
      padding: clamp(1rem, 3vw, 2rem);
    }
    .stage {
      margin: 0;
      color: var(--mv-green-dark);
      font-weight: 800;
    }
    section {
      border: 1px solid var(--mv-gray);
      border-radius: 0.75rem;
      padding: 1rem;
      background: var(--mv-white);
    }
    h2 {
      margin-top: 0;
      font-size: 1.05rem;
    }
    a {
      display: inline-flex;
      min-height: 44px;
      align-items: center;
      color: var(--mv-green-dark);
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditContractStatusPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly code = stringData(this.route, 'code');
  readonly title = stringData(this.route, 'title');
  readonly message = stringData(this.route, 'message');
  readonly blocker = stringData(this.route, 'blocker');
}

function stringData(route: ActivatedRoute, key: string): string {
  const value = route.snapshot.data[key];
  return typeof value === 'string' ? value : '';
}
