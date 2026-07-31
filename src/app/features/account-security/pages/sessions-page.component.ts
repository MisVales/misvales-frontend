import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, EMPTY, switchMap } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { SessionStore } from '@core/session/session.store';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';
import { UiStateComponent } from '@shared/components/ui-state.component';

import { ReauthFieldsComponent } from '../components/reauth-fields.component';
import { AccountSecurityApiService } from '../data-access/account-security-api.service';
import { AuthSessionDto } from '../models/account-security.models';

@Component({
  selector: 'mv-sessions-page',
  imports: [
    ActionButtonComponent,
    DatePipe,
    FeedbackMessageComponent,
    ReactiveFormsModule,
    ReauthFieldsComponent,
    UiStateComponent,
  ],
  template: `
    <section class="mv-panel wide">
      <p class="mv-eyebrow">Mi cuenta</p>
      <h1>Sesiones activas</h1>
      @if (message()) {
        <mv-feedback-message [kind]="messageKind()" [message]="message()!" />
      }
      @if (loading()) {
        <mv-ui-state kind="loading" message="Consultando sesiones…" />
      } @else if (sessions().length === 0) {
        <mv-ui-state kind="empty" message="No se encontraron sesiones activas." />
      } @else {
        <div class="sessions">
          @for (item of sessions(); track item.id) {
            <article>
              <h2>{{ item.device_name || 'Dispositivo sin nombre' }}</h2>
              <p>{{ item.application }} · {{ item.ip_address || 'IP no disponible' }}</p>
              <p>Última actividad: {{ item.last_activity_at | date: 'medium' }}</p>
              @if (item.is_current) {
                <strong>Sesión actual</strong>
              } @else {
                <button type="button" (click)="selectSession(item)">Revocar sesión</button>
              }
            </article>
          }
        </div>
        @if (hasOtherSessions()) {
          <mv-action-button
            variant="destructive"
            [disabled]="pending()"
            (activated)="selectOtherSessions()"
          >
            Revocar las demás sesiones
          </mv-action-button>
        }
      }
      @if (selected() || revokeOthers()) {
        <form class="mv-form" [formGroup]="form" (ngSubmit)="revoke()">
          <h2>
            {{ revokeOthers() ? 'Revocar las demás sesiones' : 'Confirmar revocación' }}
          </h2>
          @if (revokeOthers()) {
            <p>La sesión actual permanecerá activa. Las demás sesiones serán revocadas.</p>
          }
          <mv-reauth-fields [password]="form.controls.password" [totp]="form.controls.totp_code" />
          <div class="mv-choice-row">
            <button type="button" (click)="cancelRevocation()">Cancelar</button>
            <mv-action-button buttonType="submit" [pending]="pending()" [disabled]="form.invalid">
              Revocar
            </mv-action-button>
          </div>
        </form>
      }
    </section>
  `,
  styles: `
    .wide {
      width: min(100%, 54rem);
    }
    .sessions {
      display: grid;
      gap: 0.75rem;
    }
    article {
      border: 1px solid var(--mv-gray);
      border-radius: 0.7rem;
      padding: 1rem;
    }
    article h2 {
      font-size: 1rem;
    }
    button {
      min-height: 44px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsPageComponent {
  private readonly api = inject(AccountSecurityApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly session = inject(SessionStore);
  readonly sessions = signal<readonly AuthSessionDto[]>([]);
  readonly selected = signal<AuthSessionDto | null>(null);
  readonly revokeOthers = signal(false);
  readonly loading = signal(true);
  readonly pending = signal(false);
  readonly message = signal<string | null>(null);
  readonly messageKind = signal<'error' | 'success'>('success');
  readonly hasOtherSessions = computed(() => this.sessions().some((item) => !item.is_current));
  readonly form = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    totp_code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api
      .sessions()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.loading.set(false);
          this.messageKind.set('error');
          this.message.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe((sessions) => {
        this.loading.set(false);
        this.sessions.set(sessions);
      });
  }

  revoke(): void {
    const selected = this.selected();
    const revokeOthers = this.revokeOthers();
    const access = this.session.access();
    if ((!selected && !revokeOthers) || !access || this.form.invalid || this.pending()) return;
    this.pending.set(true);
    const value = this.form.getRawValue();
    const action = revokeOthers ? 'sessions.revoke_others' : 'sessions.revoke';
    const resourceId = revokeOthers ? 'others' : selected!.id;
    this.api
      .reauthenticate({
        method: 'PASSWORD_TOTP',
        action,
        resource_type: 'auth_sessions',
        resource_id: resourceId,
        branch_id: access.branchId ?? null,
        parameters: {},
        reason: null,
        password: value.password,
        totp_code: value.totp_code,
      })
      .pipe(
        switchMap((authorization) =>
          revokeOthers
            ? this.api.revokeOtherSessions(authorization.authorization_token)
            : this.api.revokeSession(selected!.id, authorization.authorization_token),
        ),
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.pending.set(false);
          this.messageKind.set('error');
          this.message.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.pending.set(false);
        this.selected.set(null);
        this.revokeOthers.set(false);
        this.form.reset();
        this.messageKind.set('success');
        this.message.set(
          revokeOthers ? 'Las demás sesiones fueron revocadas.' : 'La sesión fue revocada.',
        );
        this.load();
      });
  }

  selectOtherSessions(): void {
    if (!this.hasOtherSessions() || this.pending()) return;
    this.selected.set(null);
    this.revokeOthers.set(true);
    this.form.reset();
  }

  selectSession(session: AuthSessionDto): void {
    if (session.is_current || this.pending()) return;
    this.revokeOthers.set(false);
    this.selected.set(session);
    this.form.reset();
  }

  cancelRevocation(): void {
    this.selected.set(null);
    this.revokeOthers.set(false);
    this.form.reset();
  }
}
