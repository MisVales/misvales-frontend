import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, EMPTY, switchMap } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { SessionStore } from '@core/session/session.store';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';

import { ReauthFieldsComponent } from '../components/reauth-fields.component';
import { AccountSecurityApiService } from '../data-access/account-security-api.service';

@Component({
  selector: 'mv-recovery-codes-page',
  imports: [
    ActionButtonComponent,
    FeedbackMessageComponent,
    ReactiveFormsModule,
    ReauthFieldsComponent,
  ],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Mi cuenta</p>
      <h1>Códigos de recuperación</h1>
      <p>Regenerar invalida inmediatamente cualquier conjunto anterior.</p>
      @if (message()) {
        <mv-feedback-message [kind]="messageKind()" [message]="message()!" />
      }
      @if (codes()) {
        <ul class="codes" aria-label="Nuevos códigos de recuperación">
          @for (code of codes(); track code) {
            <li>
              <code>{{ revealed() ? code : '••••-••••' }}</code>
            </li>
          }
        </ul>
        <button type="button" (click)="revealed.set(!revealed())">
          {{ revealed() ? 'Ocultar códigos' : 'Revelar códigos' }}
        </button>
        <label class="confirm">
          <input type="checkbox" [formControl]="confirmed" />
          Confirmo que guardé los códigos en un lugar seguro.
        </label>
        <mv-action-button [disabled]="!confirmed.value" (activated)="discard()">
          Finalizar y borrar de esta pantalla
        </mv-action-button>
      } @else {
        <form class="mv-form" [formGroup]="form" (ngSubmit)="regenerate()">
          <mv-reauth-fields [password]="form.controls.password" [totp]="form.controls.totp_code" />
          <mv-action-button buttonType="submit" [pending]="pending()" [disabled]="form.invalid">
            Regenerar códigos
          </mv-action-button>
        </form>
      }
    </section>
  `,
  styles: `
    .codes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
      gap: 0.5rem;
      padding: 0;
      list-style: none;
    }
    .codes li {
      border: 1px solid var(--mv-gray);
      border-radius: 0.5rem;
      padding: 0.6rem;
    }
    .confirm {
      display: flex;
      gap: 0.6rem;
      align-items: flex-start;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoveryCodesPageComponent {
  private readonly api = inject(AccountSecurityApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly session = inject(SessionStore);
  readonly codes = signal<readonly string[] | null>(null);
  readonly revealed = signal(false);
  readonly pending = signal(false);
  readonly message = signal<string | null>(null);
  readonly messageKind = signal<'error' | 'success'>('success');
  readonly confirmed = new FormControl(false, { nonNullable: true });
  readonly form = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    totp_code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.codes.set(null));
  }

  regenerate(): void {
    const access = this.session.access();
    if (!access?.identity || this.form.invalid || this.pending()) return;
    this.pending.set(true);
    const value = this.form.getRawValue();
    this.api
      .reauthenticate({
        method: 'PASSWORD_TOTP',
        action: 'mfa.recovery_codes.regenerate',
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
          this.api.regenerateRecoveryCodes(authorization.authorization_token),
        ),
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.pending.set(false);
          this.messageKind.set('error');
          this.message.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe((codes) => {
        this.pending.set(false);
        this.codes.set(codes);
        this.revealed.set(false);
      });
  }

  discard(): void {
    if (!this.confirmed.value) return;
    this.codes.set(null);
    this.confirmed.setValue(false);
    this.form.reset();
    this.messageKind.set('success');
    this.message.set('Los códigos fueron retirados de la memoria de esta pantalla.');
  }
}
