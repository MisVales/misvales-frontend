import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, EMPTY, switchMap } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import {
  arrayBufferToBase64Url,
  base64UrlToArrayBuffer,
  webAuthnAvailable,
} from '@core/security/webauthn.util';
import { SessionStore } from '@core/session/session.store';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';
import { UiStateComponent } from '@shared/components/ui-state.component';

import { ReauthFieldsComponent } from '../components/reauth-fields.component';
import { AccountSecurityApiService } from '../data-access/account-security-api.service';

@Component({
  selector: 'mv-passkeys-page',
  imports: [
    ActionButtonComponent,
    FeedbackMessageComponent,
    ReactiveFormsModule,
    ReauthFieldsComponent,
    UiStateComponent,
  ],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Mi cuenta</p>
      <h1>Passkeys</h1>
      @if (!available) {
        <mv-ui-state
          kind="error"
          message="Este navegador o contexto no permite registrar passkeys."
        />
      } @else {
        <p>El navegador creará la credencial; MisVales nunca captura la clave privada.</p>
        @if (message()) {
          <mv-feedback-message [kind]="messageKind()" [message]="message()!" />
        }
        <form class="mv-form" [formGroup]="form" (ngSubmit)="register()">
          <mv-reauth-fields [password]="form.controls.password" [totp]="form.controls.totp_code" />
          <mv-action-button buttonType="submit" [pending]="pending()" [disabled]="form.invalid">
            Registrar passkey
          </mv-action-button>
        </form>
        <mv-ui-state
          kind="error"
          title="Retiro no disponible"
          message="El contrato no publica un listado de passkeys inscritas ni su identificador eliminable; no se solicitan identificadores manuales."
        />
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasskeysPageComponent {
  private readonly api = inject(AccountSecurityApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly session = inject(SessionStore);
  readonly available = webAuthnAvailable();
  readonly pending = signal(false);
  readonly message = signal<string | null>(null);
  readonly messageKind = signal<'error' | 'success'>('success');
  readonly form = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    totp_code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  register(): void {
    const access = this.session.access();
    if (!this.available || !access?.identity || this.form.invalid || this.pending()) return;
    this.pending.set(true);
    const value = this.form.getRawValue();
    this.api
      .reauthenticate({
        method: 'PASSWORD_TOTP',
        action: 'mfa.passkey.add',
        resource_type: 'mfa_credentials',
        resource_id: access.identity.id,
        branch_id: access.branchId ?? null,
        parameters: {},
        reason: null,
        password: value.password,
        totp_code: value.totp_code,
      })
      .pipe(
        switchMap((authorization) =>
          this.api.passkeyOptions().pipe(
            switchMap(async (options) => {
              const credential = await navigator.credentials.create({
                publicKey: {
                  ...options,
                  challenge: base64UrlToArrayBuffer(options.challenge),
                  pubKeyCredParams: [...options.pubKeyCredParams],
                  user: { ...options.user, id: base64UrlToArrayBuffer(options.user.id) },
                  excludeCredentials: options.excludeCredentials?.map((item) => ({
                    ...item,
                    id: base64UrlToArrayBuffer(item.id),
                  })),
                },
              });
              if (!(credential instanceof PublicKeyCredential)) {
                throw new Error('PASSKEY_CANCELLED');
              }
              const response = credential.response;
              if (!(response instanceof AuthenticatorAttestationResponse)) {
                throw new Error('INVALID_PASSKEY_ATTESTATION');
              }
              return this.api.registerPasskey(
                arrayBufferToBase64Url(response.clientDataJSON),
                arrayBufferToBase64Url(response.attestationObject),
                authorization.authorization_token,
              );
            }),
            switchMap((request) => request),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError | Error) => {
          this.pending.set(false);
          this.messageKind.set('error');
          this.message.set(
            'status' in error ? error.message : 'El registro de passkey fue cancelado.',
          );
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.pending.set(false);
        this.form.reset();
        this.messageKind.set('success');
        this.message.set('La passkey quedó registrada.');
      });
  }
}
