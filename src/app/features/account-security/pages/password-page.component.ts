import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, switchMap } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { SessionStore } from '@core/session/session.store';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';
import { applyServerValidation } from '@shared/forms/server-validation.util';
import { passwordMatchValidator } from '@shared/validators/password-match.validator';

import { ReauthFieldsComponent } from '../components/reauth-fields.component';
import { AccountSecurityApiService } from '../data-access/account-security-api.service';

@Component({
  selector: 'mv-password-page',
  imports: [
    ActionButtonComponent,
    FeedbackMessageComponent,
    ReactiveFormsModule,
    ReauthFieldsComponent,
  ],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Mi cuenta</p>
      <h1>Cambiar contraseña</h1>
      @if (message()) {
        <mv-feedback-message kind="error" [message]="message()!" />
      }
      <form class="mv-form" [formGroup]="form" (ngSubmit)="submit()">
        <div class="mv-field">
          <label for="password-new">Nueva contraseña</label>
          <input
            id="password-new"
            type="password"
            autocomplete="new-password"
            formControlName="password"
          />
        </div>
        <div class="mv-field">
          <label for="password-confirmation">Confirmar contraseña</label>
          <input
            id="password-confirmation"
            type="password"
            autocomplete="new-password"
            formControlName="password_confirmation"
          />
          @if (form.hasError('passwordMismatch')) {
            <span class="mv-error" role="alert">Las contraseñas no coinciden.</span>
          }
        </div>
        <mv-reauth-fields
          [password]="form.controls.current_password"
          [totp]="form.controls.totp_code"
        />
        <mv-action-button buttonType="submit" [pending]="pending()" [disabled]="form.invalid">
          Cambiar contraseña
        </mv-action-button>
      </form>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordPageComponent {
  private readonly api = inject(AccountSecurityApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly session = inject(SessionStore);
  readonly pending = signal(false);
  readonly message = signal<string | null>(null);
  readonly form = new FormGroup(
    {
      password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      password_confirmation: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      current_password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      totp_code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: [passwordMatchValidator] },
  );

  submit(): void {
    const access = this.session.access();
    if (!access?.identity || this.form.invalid || this.pending()) {
      return;
    }
    this.pending.set(true);
    this.message.set(null);
    const value = this.form.getRawValue();
    this.api
      .reauthenticate({
        method: 'PASSWORD_TOTP',
        action: 'password.change',
        resource_type: 'users',
        resource_id: access.identity.id,
        branch_id: access.branchId ?? null,
        parameters: {},
        reason: null,
        password: value.current_password,
        totp_code: value.totp_code,
      })
      .pipe(
        switchMap((authorization) =>
          this.api.changePassword(
            value.password,
            value.password_confirmation,
            authorization.authorization_token,
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.pending.set(false);
          this.message.set(error.message);
          if (error.status === 422) {
            applyServerValidation(this.form, error.fields);
          }
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.session.clear();
        this.form.reset();
        void this.router.navigate(['/acceso']);
      });
  }
}
