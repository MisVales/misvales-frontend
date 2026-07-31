import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { SessionStore } from '@core/session/session.store';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';
import { UiStateComponent } from '@shared/components/ui-state.component';

import { AccountSecurityApiService } from '../data-access/account-security-api.service';
import { SecurityAlertDto } from '../models/account-security.models';

@Component({
  selector: 'mv-alerts-page',
  imports: [
    ActionButtonComponent,
    DatePipe,
    FeedbackMessageComponent,
    RouterLink,
    UiStateComponent,
  ],
  template: `
    <section class="mv-panel wide">
      <p class="mv-eyebrow">Mi cuenta</p>
      <h1>Alertas de seguridad</h1>
      @if (message()) {
        <mv-feedback-message [kind]="messageKind()" [message]="message()!" />
      }
      @if (loading()) {
        <mv-ui-state kind="loading" message="Consultando alertas…" />
      } @else if (alerts().length === 0) {
        <mv-ui-state kind="empty" message="No hay alertas dentro de tu alcance." />
      } @else {
        <div class="alerts">
          @for (alert of alerts(); track alert.id) {
            <article>
              <header>
                <h2>{{ alert.title || alert.type || 'Alerta de seguridad' }}</h2>
                <span>{{ alert.severity || alert.status || 'Informativa' }}</span>
              </header>
              <p>{{ alert.message || 'Consulta el detalle entregado por el backend.' }}</p>
              @if (alert.created_at) {
                <small>{{ alert.created_at | date: 'medium' }}</small>
              }
              @if (safeActionPath(alert.action_path); as actionPath) {
                <a [routerLink]="actionPath">Abrir detalle autorizado</a>
              }
              @if (!alert.acknowledged_at) {
                <mv-action-button
                  [pending]="pendingId() === 'acknowledge:' + alert.id"
                  (activated)="acknowledge(alert)"
                >
                  Reconocer
                </mv-action-button>
              }
              @if (alert.can_request_action) {
                <mv-action-button
                  variant="secondary"
                  [pending]="pendingId() === 'request:' + alert.id"
                  (activated)="requestAction(alert)"
                >
                  Solicitar acción
                </mv-action-button>
              }
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: `
    .wide {
      width: min(100%, 54rem);
    }
    .alerts {
      display: grid;
      gap: 0.75rem;
    }
    article {
      display: grid;
      gap: 0.65rem;
      border: 1px solid var(--mv-gray);
      border-radius: 0.7rem;
      padding: 1rem;
    }
    header {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
    }
    h2 {
      font-size: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsPageComponent {
  private readonly api = inject(AccountSecurityApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly session = inject(SessionStore);
  readonly alerts = signal<readonly SecurityAlertDto[]>([]);
  readonly loading = signal(true);
  readonly pendingId = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly messageKind = signal<'error' | 'success'>('success');

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api
      .alerts()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError | Error) => {
          this.loading.set(false);
          this.messageKind.set('error');
          this.message.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe((response) => {
        this.loading.set(false);
        this.alerts.set(response.data);
      });
  }

  acknowledge(alert: SecurityAlertDto): void {
    if (this.pendingId()) return;
    this.pendingId.set(`acknowledge:${alert.id}`);
    this.api
      .acknowledgeAlert(alert.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.pendingId.set(null);
          this.messageKind.set('error');
          this.message.set(error.message);
          if (error.status === 409) this.load();
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.pendingId.set(null);
        this.messageKind.set('success');
        this.message.set('La alerta fue reconocida; esto no la marca como resuelta.');
        this.load();
      });
  }

  requestAction(alert: SecurityAlertDto): void {
    if (!alert.can_request_action || this.pendingId()) return;
    this.pendingId.set(`request:${alert.id}`);
    this.api
      .requestAlertAction(alert.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.pendingId.set(null);
          this.messageKind.set('error');
          this.message.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.pendingId.set(null);
        this.messageKind.set('success');
        this.message.set('La acción fue solicitada y quedó sujeta a validación del backend.');
        this.load();
      });
  }

  safeActionPath(path: string | null | undefined): string | null {
    const experience = this.session.access()?.experience;
    if (!path || !experience || !path.startsWith('/') || path.startsWith('//')) return null;
    if (path.includes('\\') || /\s/.test(path)) return null;
    const prefix = `/${experience}`;
    return path === prefix || path.startsWith(`${prefix}/`) ? path : null;
  }
}
