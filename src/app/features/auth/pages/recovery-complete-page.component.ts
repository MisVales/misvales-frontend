import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';
import { applyServerValidation } from '@shared/forms/server-validation.util';
import { passwordMatchValidator } from '@shared/validators/password-match.validator';

import { AuthApiService } from '../data-access/auth-api.service';
import { RecoveryFactorType } from '../models/auth.models';
import { AuthFlowStore } from '../state/auth-flow.store';

@Component({
  selector: 'mv-recovery-complete-page',
  imports: [ActionButtonComponent, FeedbackMessageComponent, ReactiveFormsModule],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Recuperación</p>
      <h2>Establecer nueva contraseña</h2>
      @if (message()) {
        <mv-feedback-message kind="error" [message]="message()!" />
      }
      <form class="mv-form" [formGroup]="form" (ngSubmit)="submit()">
        <div class="mv-field">
          <label for="new-password">Nueva contraseña</label>
          <input
            id="new-password"
            type="password"
            autocomplete="new-password"
            formControlName="password"
          />
        </div>
        <div class="mv-field">
          <label for="confirm-password">Confirmar contraseña</label>
          <input
            id="confirm-password"
            type="password"
            autocomplete="new-password"
            formControlName="password_confirmation"
          />
          @if (form.hasError('passwordMismatch')) {
            <span class="mv-error" role="alert">Las contraseñas no coinciden.</span>
          }
        </div>
        <div class="mv-field">
          <label for="factor-type">Segundo factor</label>
          <select id="factor-type" formControlName="factor_type">
            <option value="TOTP">Autenticador TOTP</option>
            <option value="RECOVERY_CODE">Código de recuperación</option>
            <option value="PASSKEY_AUTHORIZATION">Autorización con passkey</option>
          </select>
        </div>
        <div class="mv-field">
          <label for="factor-value">Valor del factor</label>
          <input
            id="factor-value"
            type="password"
            autocomplete="one-time-code"
            formControlName="factor_value"
          />
        </div>
        <mv-action-button buttonType="submit" [pending]="pending()" [disabled]="form.invalid">
          Actualizar contraseña
        </mv-action-button>
      </form>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoveryCompletePageComponent {
  private readonly api = inject(AuthApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly flow = inject(AuthFlowStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly pending = signal(false);
  readonly message = signal<string | null>(null);
  readonly form = new FormGroup(
    {
      password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      password_confirmation: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      factor_type: new FormControl<RecoveryFactorType>('TOTP', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      factor_value: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: [passwordMatchValidator] },
  );

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.flow.setRecoveryToken(token);
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }
  }

  submit(): void {
    const token = this.flow.recoveryToken();
    if (!token || this.form.invalid || this.pending()) {
      return;
    }
    this.pending.set(true);
    this.message.set(null);
    const value = this.form.getRawValue();
    this.api
      .completeRecovery({ token, ...value })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.pending.set(false);
          this.message.set(error.message);
          if (error.status === 422) {
            applyServerValidation(this.form, error.fields);
          }
          if (error.status === 409) {
            this.flow.clearRecovery();
          }
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.pending.set(false);
        this.flow.clearRecovery();
        void this.router.navigate(['/acceso']);
      });
  }
}
