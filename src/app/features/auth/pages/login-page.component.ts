import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, switchMap } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { CsrfService } from '@core/auth/csrf.service';
import { RequestSupportService } from '@core/error-handling/request-support.service';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';
import { TechnicalFieldComponent } from '@shared/forms/technical-field.component';
import { applyServerValidation } from '@shared/forms/server-validation.util';

import { AuthApiService } from '../data-access/auth-api.service';
import { LoginRequest } from '../models/auth.models';
import { AuthFlowStore } from '../state/auth-flow.store';

@Component({
  selector: 'mv-login-page',
  imports: [
    ActionButtonComponent,
    FeedbackMessageComponent,
    ReactiveFormsModule,
    RouterLink,
    TechnicalFieldComponent,
  ],
  template: `
    <section class="mv-panel" aria-labelledby="login-title">
      <p class="mv-eyebrow">Cuenta MisVales</p>
      <h2 id="login-title">Iniciar sesión</h2>
      <p>Selecciona la experiencia desde la que estás ingresando.</p>

      @if (message()) {
        <mv-feedback-message kind="error" [message]="message()!" />
      }

      <form class="mv-form" [formGroup]="form" (ngSubmit)="submit()">
        <mv-technical-field
          name="email"
          label="Correo electrónico"
          kind="email"
          [required]="true"
          [control]="form.controls.email"
          [serverErrors]="serverErrors('email')"
        />
        <div class="mv-field">
          <label for="password">Contraseña <span aria-hidden="true">*</span></label>
          <input
            id="password"
            type="password"
            autocomplete="current-password"
            formControlName="password"
            required
            [attr.aria-invalid]="form.controls.password.invalid && form.controls.password.touched"
          />
          @for (error of serverErrors('password'); track error) {
            <span class="mv-error" role="alert">{{ error }}</span>
          }
        </div>
        <mv-technical-field
          name="application"
          label="Experiencia"
          kind="select"
          [required]="true"
          [control]="form.controls.application"
          [options]="applications"
          [serverErrors]="serverErrors('application')"
        />

        <mv-action-button
          buttonType="submit"
          [pending]="pending()"
          [disabled]="form.invalid || rateLimited()"
        >
          {{ rateLimited() ? 'Espera antes de reintentar' : 'Continuar' }}
        </mv-action-button>
      </form>

      <a routerLink="/acceso/recuperar">¿Olvidaste tu contraseña?</a>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly api = inject(AuthApiService);
  private readonly csrf = inject(CsrfService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly flow = inject(AuthFlowStore);
  private readonly router = inject(Router);
  private readonly support = inject(RequestSupportService);

  readonly pending = signal(false);
  readonly message = signal<string | null>(null);
  readonly now = signal(Date.now());
  readonly applications = [
    { label: 'Administrativa', value: 'administrativa' },
    { label: 'Tableta', value: 'tableta' },
    { label: 'Distribuidora', value: 'distribuidora' },
  ] as const;
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    application: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    const timer = window.setInterval(() => this.now.set(Date.now()), 1000);
    this.destroyRef.onDestroy(() => window.clearInterval(timer));
  }

  rateLimited(): boolean {
    const blockedUntil = this.support.blockedUntil();
    return blockedUntil !== null && blockedUntil > this.now();
  }

  serverErrors(name: string): readonly string[] {
    return (this.form.get(name)?.errors?.['server'] as readonly string[] | undefined) ?? [];
  }

  submit(): void {
    if (this.form.invalid || this.pending() || this.rateLimited()) {
      this.form.markAllAsTouched();
      return;
    }
    this.pending.set(true);
    this.message.set(null);
    const value = this.form.getRawValue();
    const payload: LoginRequest = {
      email: value.email,
      password: value.password,
      application: value.application as LoginRequest['application'],
    };

    this.csrf
      .refresh()
      .pipe(
        switchMap(() => this.api.login(payload)),
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
      .subscribe((response) => {
        this.pending.set(false);
        this.flow.setChallenge({
          application: payload.application,
          mfaToken: response.data.mfa_token,
          expiresAt: response.data.expires_at,
          allowedFactors: response.data.allowed_factors,
          webauthnChallenge: response.data.webauthn_challenge,
        });
        void this.router.navigate(['/acceso/verificacion']);
      });
  }
}
