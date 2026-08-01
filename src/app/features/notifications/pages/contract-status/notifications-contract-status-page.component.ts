import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { UiStateComponent } from '@shared/components/ui-state.component';

@Component({
  selector: 'mv-notifications-contract-status-page',
  imports: [RouterLink, UiStateComponent],
  template: `
    <article class="contract-page">
      <p class="stage">Etapa 9 · FE26</p>
      <mv-ui-state
        kind="error"
        title="Notificaciones propias"
        [message]="message"
        [retryable]="false"
      />
      <section aria-labelledby="available-heading">
        <h2 id="available-heading">Integración disponible</h2>
        <p>
          La consulta separa contractualmente <strong>UNREAD</strong> y <strong>READ</strong>. El
          marcado individual usa el endpoint publicado y no agrega operaciones masivas.
        </p>
      </section>
      <section aria-labelledby="blocked-heading">
        <h2 id="blocked-heading">Navegación bloqueada de forma segura</h2>
        <p>{{ blocker }}</p>
      </section>
      <a [routerLink]="safeRoot">Volver a una ruta segura</a>
    </article>
  `,
  styles: `
    .contract-page {
      display: grid;
      gap: 1rem;
      width: min(100%, 44rem);
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
export class NotificationsContractStatusPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly currentUrl = inject(Router).url;

  readonly message = stringData(this.route, 'message');
  readonly blocker = stringData(this.route, 'blocker');
  readonly safeRoot = this.currentUrl.startsWith('/movil')
    ? '/movil'
    : this.currentUrl.startsWith('/operativa')
      ? '/operativa'
      : '/administrativa';
}

function stringData(route: ActivatedRoute, key: string): string {
  const value = route.snapshot.data[key];
  return typeof value === 'string' ? value : '';
}
