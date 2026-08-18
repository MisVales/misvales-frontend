import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewStateComponent, ViewStateKind } from '../view-state/view-state.component';

type HttpStatusPage = 'forbidden' | 'not-found';

interface StatusPageConfig {
  kind: ViewStateKind;
  title: string;
  message: string;
  actionLabel: string;
}

const STATUS_CONFIG: Record<HttpStatusPage, StatusPageConfig> = {
  forbidden: {
    kind: 'forbidden',
    title: 'Acceso denegado',
    message: 'No tienes permiso para ver esta página con tu sesión actual.',
    actionLabel: 'Volver al inicio',
  },
  'not-found': {
    kind: 'error',
    title: 'Página no encontrada',
    message: 'La dirección solicitada no existe o fue movida.',
    actionLabel: 'Ir al inicio',
  },
};

@Component({
  selector: 'app-http-status-page',
  standalone: true,
  imports: [ViewStateComponent],
  template: `
    <main class="mx-auto w-full max-w-3xl p-6 lg:p-10">
      <app-view-state
        [kind]="config.kind"
        [title]="config.title"
        [message]="config.message"
        [actionLabel]="config.actionLabel"
        (action)="goHome()"
      />
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HttpStatusPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly config = STATUS_CONFIG[this.readStatus()];

  protected goHome(): void {
    void this.router.navigate(['/inicio']);
  }

  private readStatus(): HttpStatusPage {
    return this.route.snapshot.data['statusPage'] === 'forbidden' ? 'forbidden' : 'not-found';
  }
}
