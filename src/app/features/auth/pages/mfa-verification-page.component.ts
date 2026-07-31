import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, Observable, switchMap } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { experienceRoot } from '@core/guards/return-url.util';
import {
  base64UrlToArrayBuffer,
  credentialToAssertion,
  webAuthnAvailable,
} from '@core/security/webauthn.util';
import { ContextContractGateway } from '@core/session/context-contract.gateway';
import { SessionStore } from '@core/session/session.store';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';

import { AuthApiService } from '../data-access/auth-api.service';
import { MfaFactor } from '../models/auth.models';
import { AuthFlowStore } from '../state/auth-flow.store';

@Component({
  selector: 'mv-mfa-verification-page',
  imports: [ActionButtonComponent, DatePipe, FeedbackMessageComponent, ReactiveFormsModule],
  template: `
    <section class="mv-panel" aria-labelledby="mfa-title">
      <p class="mv-eyebrow">Verificación en dos pasos</p>
      <h2 id="mfa-title">Confirma tu identidad</h2>
      <p>El desafío vence el {{ challenge()?.expiresAt | date: 'medium' }}.</p>

      @if (message()) {
        <mv-feedback-message [kind]="messageKind()" [message]="message()!" />
      }

      <div class="mv-choice-row" role="group" aria-label="Factores disponibles">
        @for (factor of challenge()?.allowedFactors ?? []; track factor) {
          <button type="button" [class.active]="factor === selected()" (click)="select(factor)">
            {{ factorLabel(factor) }}
          </button>
        }
      </div>

      @if (selected() === 'TOTP' || selected() === 'RECOVERY_CODE') {
        <form class="mv-form" (submit)="verifyCode($event)">
          <div class="mv-field">
            <label for="mfa-code">{{
              selected() === 'TOTP' ? 'Código del autenticador' : 'Código de recuperación'
            }}</label>
            <input
              id="mfa-code"
              type="password"
              autocomplete="one-time-code"
              [formControl]="code"
            />
          </div>
          <mv-action-button buttonType="submit" [pending]="pending()" [disabled]="code.invalid">
            Verificar
          </mv-action-button>
        </form>
      }

      @if (selected() === 'PASSKEY') {
        <mv-action-button
          [pending]="pending()"
          [disabled]="!passkeyAvailable"
          (activated)="verifyPasskey()"
        >
          Usar passkey
        </mv-action-button>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MfaVerificationPageComponent {
  private readonly api = inject(AuthApiService);
  private readonly context = inject(ContextContractGateway);
  private readonly destroyRef = inject(DestroyRef);
  private readonly flow = inject(AuthFlowStore);
  private readonly router = inject(Router);
  private readonly session = inject(SessionStore);

  readonly challenge = this.flow.challenge;
  readonly selected = signal<MfaFactor | null>(this.challenge()?.allowedFactors[0] ?? null);
  readonly pending = signal(false);
  readonly message = signal<string | null>(null);
  readonly messageKind = signal<'error' | 'info'>('info');
  readonly code = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  readonly passkeyAvailable = webAuthnAvailable();

  select(factor: MfaFactor): void {
    this.selected.set(factor);
    this.code.reset();
    this.message.set(null);
  }

  factorLabel(factor: MfaFactor): string {
    return { PASSKEY: 'Passkey', RECOVERY_CODE: 'Código de recuperación', TOTP: 'Autenticador' }[
      factor
    ];
  }

  verifyCode(event: Event): void {
    event.preventDefault();
    const challenge = this.challenge();
    const factor = this.selected();
    if (!challenge || this.code.invalid || (factor !== 'TOTP' && factor !== 'RECOVERY_CODE')) {
      return;
    }
    const request =
      factor === 'TOTP'
        ? this.api.verifyTotp(challenge.mfaToken, this.code.value)
        : this.api.verifyRecoveryCode(challenge.mfaToken, this.code.value);
    this.complete(request);
  }

  async verifyPasskey(): Promise<void> {
    const challenge = this.challenge();
    if (!challenge?.webauthnChallenge || !this.passkeyAvailable || this.pending()) {
      this.showError('El navegador o el desafío no permiten usar una passkey.');
      return;
    }
    this.pending.set(true);
    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: base64UrlToArrayBuffer(challenge.webauthnChallenge),
          userVerification: 'required',
        },
      });
      if (!(credential instanceof PublicKeyCredential)) {
        this.pending.set(false);
        this.showError('La verificación con passkey fue cancelada.');
        return;
      }
      this.complete(this.api.verifyPasskey(challenge.mfaToken, credentialToAssertion(credential)));
    } catch {
      this.pending.set(false);
      this.showError('La verificación con passkey fue cancelada.');
    }
  }

  private complete(request: Observable<void>): void {
    const challenge = this.challenge();
    if (!challenge || this.pending()) {
      return;
    }
    this.pending.set(true);
    this.message.set(null);
    request
      .pipe(
        switchMap(() => this.context.load()),
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError | Error) => {
          this.pending.set(false);
          this.showError(
            'message' in error ? error.message : 'No fue posible completar la verificación.',
          );
          return EMPTY;
        }),
      )
      .subscribe((access) => {
        this.pending.set(false);
        if (access.experience !== challenge.application) {
          this.flow.clearChallenge();
          void this.router.navigate(['/403']);
          return;
        }
        this.session.establish(access);
        this.flow.clearChallenge();
        void this.router.navigateByUrl(experienceRoot(access.experience));
      });
  }

  private showError(message: string): void {
    this.messageKind.set('error');
    this.message.set(message);
  }
}
