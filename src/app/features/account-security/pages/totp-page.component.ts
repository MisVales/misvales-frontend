import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, EMPTY, switchMap } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { ContextContractGateway } from '@core/session/context-contract.gateway';
import { SessionStore } from '@core/session/session.store';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';

import { ReauthFieldsComponent } from '../components/reauth-fields.component';
import { AccountSecurityApiService } from '../data-access/account-security-api.service';
import { TotpSetup } from '../models/account-security.models';

@Component({
  selector: 'mv-totp-page',
  imports: [
    ActionButtonComponent,
    FeedbackMessageComponent,
    ReactiveFormsModule,
    ReauthFieldsComponent,
  ],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Mi cuenta</p>
      <h1>Autenticador TOTP</h1>
      @if (message()) {
        <mv-feedback-message [kind]="messageKind()" [message]="message()!" />
      }
      @if (!setup()) {
        <p>Inicia una inscripción para obtener el secreto y la URI entregados por el backend.</p>
        <mv-action-button [pending]="pending()" (activated)="begin()"
          >Iniciar inscripción</mv-action-button
        >
      } @else {
        <div class="mv-secret">
          <strong>Secreto</strong>
          <code>{{ revealed() ? setup()!.secret : '••••••••••••••••' }}</code>
          <button type="button" (click)="revealed.set(!revealed())">
            {{ revealed() ? 'Ocultar' : 'Revelar' }}
          </button>
          <button type="button" (click)="copy(setup()!.secret)">Copiar secreto</button>
        </div>
        <div class="mv-secret">
          <strong>URI de enrolamiento</strong>
          <code>{{ revealed() ? setup()!.uri : '••••••••••••••••' }}</code>
          <button type="button" (click)="copy(setup()!.uri)">Copiar URI</button>
        </div>
        <form class="mv-form" [formGroup]="form" (ngSubmit)="confirm()">
          <div class="mv-field">
            <label for="totp-confirm-code">Código del nuevo autenticador</label>
            <input
              id="totp-confirm-code"
              inputmode="numeric"
              autocomplete="one-time-code"
              formControlName="code"
            />
          </div>
          <mv-reauth-fields [password]="form.controls.password" [totp]="form.controls.totp_code" />
          <mv-action-button buttonType="submit" [pending]="pending()" [disabled]="form.invalid">
            Confirmar TOTP
          </mv-action-button>
        </form>
      }
    </section>
  `,
  styles: `
    .mv-secret {
      display: grid;
      gap: 0.5rem;
      border: 1px solid var(--mv-gray);
      border-radius: 0.7rem;
      padding: 0.8rem;
    }
    code {
      overflow-wrap: anywhere;
    }
    button {
      min-height: 44px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotpPageComponent {
  private readonly api = inject(AccountSecurityApiService);
  private readonly context = inject(ContextContractGateway);
  private readonly destroyRef = inject(DestroyRef);
  private readonly session = inject(SessionStore);
  readonly setup = signal<TotpSetup | null>(null);
  readonly revealed = signal(false);
  readonly pending = signal(false);
  readonly message = signal<string | null>(null);
  readonly messageKind = signal<'error' | 'info' | 'success'>('info');
  readonly form = new FormGroup({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    totp_code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.setup.set(null));
  }

  begin(): void {
    if (this.pending()) return;
    this.pending.set(true);
    this.api
      .setupTotp()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => this.failure(error)),
      )
      .subscribe((setup) => {
        this.pending.set(false);
        this.setup.set(setup);
      });
  }

  confirm(): void {
    const setup = this.setup();
    const access = this.session.access();
    if (!setup || !access?.identity || this.form.invalid || this.pending()) return;
    this.pending.set(true);
    const value = this.form.getRawValue();
    this.api
      .reauthenticate({
        method: 'PASSWORD_TOTP',
        action: 'mfa.totp.add',
        resource_type: 'users',
        resource_id: access.identity.id,
        branch_id: access.branchId ?? null,
        parameters: {},
        reason: null,
        password: value.password,
        totp_code: value.totp_code,
      })
      .pipe(
        switchMap((authorization) =>
          this.api.confirmTotp(setup.secret, value.code, authorization.authorization_token),
        ),
        switchMap(() => this.context.load()),
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => this.failure(error)),
      )
      .subscribe((accessContext) => {
        this.pending.set(false);
        this.session.establish(accessContext);
        this.setup.set(null);
        this.form.reset();
        this.messageKind.set('success');
        this.message.set('El autenticador TOTP quedó confirmado por el backend.');
      });
  }

  async copy(value: string): Promise<void> {
    await navigator.clipboard.writeText(value);
    this.messageKind.set('info');
    this.message.set('Valor copiado. No lo compartas.');
  }

  private failure(error: NormalizedApiError): typeof EMPTY {
    this.pending.set(false);
    this.messageKind.set('error');
    this.message.set(error.message);
    return EMPTY;
  }
}
