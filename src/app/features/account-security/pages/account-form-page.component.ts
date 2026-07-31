import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, switchMap } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { SessionStore } from '@core/session/session.store';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';
import { applyServerValidation } from '@shared/forms/server-validation.util';

import { ReauthFieldsComponent } from '../components/reauth-fields.component';
import { AccountSecurityApiService } from '../data-access/account-security-api.service';
import { AccountsApiService } from '../data-access/accounts-api.service';
import { AccountRequestRole, DirectAccountRole } from '../models/accounts.models';
import { BranchOption, OrganizationApiService } from '../../organization/public-api';

@Component({
  selector: 'mv-account-form-page',
  imports: [
    ActionButtonComponent,
    FeedbackMessageComponent,
    ReactiveFormsModule,
    ReauthFieldsComponent,
  ],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Cuentas</p>
      <h1>{{ direct ? 'Nueva cuenta' : 'Nueva solicitud de cuenta' }}</h1>
      @if (message()) {
        <mv-feedback-message kind="error" [message]="message()!" />
      }
      <form class="mv-form" [formGroup]="form" (ngSubmit)="submit()">
        <div class="mv-field">
          <label for="account-name">Nombre</label>
          <input id="account-name" formControlName="name" />
        </div>
        <div class="mv-field">
          <label for="account-email">Correo</label>
          <input id="account-email" type="email" formControlName="email" />
        </div>
        <div class="mv-field">
          <label for="account-role">Rol</label>
          <select id="account-role" formControlName="role">
            <option value="">Selecciona</option>
            @for (role of roles; track role.value) {
              <option [value]="role.value">{{ role.label }}</option>
            }
          </select>
        </div>
        @if (direct) {
          <div class="mv-field">
            <label for="account-branch">Sucursal</label>
            <select id="account-branch" formControlName="branch_id">
              <option value="">Sin sucursal</option>
              @for (branch of branches(); track branch.id) {
                <option [value]="branch.id">{{ branch.name }}</option>
              }
            </select>
          </div>
        } @else {
          <div class="mv-field">
            <label for="account-reason">Motivo</label>
            <textarea id="account-reason" formControlName="reason"></textarea>
          </div>
        }
        <mv-reauth-fields [password]="form.controls.password" [totp]="form.controls.totp_code" />
        <mv-action-button buttonType="submit" [pending]="pending()" [disabled]="form.invalid">
          {{ direct ? 'Crear cuenta e invitación' : 'Enviar solicitud' }}
        </mv-action-button>
      </form>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountFormPageComponent {
  private readonly accounts = inject(AccountsApiService);
  private readonly organization = inject(OrganizationApiService);
  private readonly security = inject(AccountSecurityApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(SessionStore);
  readonly direct = this.route.snapshot.data['direct'] === true;
  readonly branches = signal<readonly BranchOption[]>([]);
  readonly pending = signal(false);
  readonly message = signal<string | null>(null);
  readonly roles = this.direct
    ? [
        { value: 'COORDINATOR', label: 'Coordinador' },
        { value: 'VERIFIER', label: 'Verificador' },
        { value: 'ADMINISTRATOR', label: 'Administrador' },
        { value: 'CASHIER', label: 'Cajera' },
      ]
    : [
        { value: 'COORDINATOR', label: 'Coordinador' },
        { value: 'VERIFIER', label: 'Verificador' },
        { value: 'CASHIER', label: 'Cajera' },
      ];
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    role: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    branch_id: new FormControl('', { nonNullable: true }),
    reason: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    totp_code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  private command = this.accounts.newIdempotentCommand();

  constructor() {
    if (this.direct) {
      this.organization
        .branches()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((branches) => this.branches.set(branches));
    } else {
      this.form.controls.reason.addValidators(Validators.required);
      this.form.controls.reason.updateValueAndValidity();
    }
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => (this.command = this.accounts.newIdempotentCommand()));
  }

  submit(): void {
    const access = this.session.access();
    if (!access || this.form.invalid || this.pending()) return;
    this.pending.set(true);
    this.message.set(null);
    const value = this.form.getRawValue();
    const action = this.direct ? 'accounts.create' : 'account_requests.create';
    this.security
      .reauthenticate({
        method: 'PASSWORD_TOTP',
        action,
        resource_type: this.direct ? 'accounts' : 'account_requests',
        resource_id: access.identity?.id ?? null,
        branch_id: access.branchId ?? null,
        parameters: {},
        reason: value.reason || null,
        password: value.password,
        totp_code: value.totp_code,
      })
      .pipe(
        switchMap((authorization) =>
          this.direct
            ? this.accounts.createAccount({
                name: value.name,
                email: value.email,
                role: value.role as DirectAccountRole,
                branch_id: value.branch_id || null,
                authorization_token: authorization.authorization_token,
              })
            : this.accounts.createRequest(
                {
                  name: value.name,
                  email: value.email,
                  role: value.role as AccountRequestRole,
                  reason: value.reason,
                  reauth_token: authorization.authorization_token,
                },
                this.command,
              ),
        ),
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.pending.set(false);
          this.message.set(error.message);
          if (error.status === 422) applyServerValidation(this.form, error.fields);
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.pending.set(false);
        void this.router.navigate(['/administrativa/cuentas/solicitudes']);
      });
  }
}
