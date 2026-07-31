import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, forkJoin } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';
import { UiStateComponent } from '@shared/components/ui-state.component';

import { OrganizationApiService } from '../data-access/organization-api.service';
import { BranchOption, OrganizationUserOption, RoleOption } from '../models/organization.models';

@Component({
  selector: 'mv-scope-form-page',
  imports: [ActionButtonComponent, FeedbackMessageComponent, ReactiveFormsModule, UiStateComponent],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Organización</p>
      <h1>Asignar alcance</h1>
      @if (loading()) {
        <mv-ui-state kind="loading" message="Cargando opciones autorizadas…" />
      } @else {
        @if (message()) {
          <mv-feedback-message kind="error" [message]="message()!" />
        }
        <form class="mv-form" [formGroup]="form" (ngSubmit)="submit()">
          <div class="mv-field">
            <label for="scope-user">Usuario</label>
            <select id="scope-user" formControlName="user_public_id">
              <option value="">Selecciona</option>
              @for (user of users(); track user.id) {
                <option [value]="user.id">{{ user.name }} · {{ user.email }}</option>
              }
            </select>
          </div>
          <div class="mv-field">
            <label for="scope-role">Rol</label>
            <select id="scope-role" formControlName="role_id">
              <option [ngValue]="null">Selecciona</option>
              @for (role of roles(); track role.id) {
                <option [ngValue]="role.id">{{ role.name }} · {{ role.code }}</option>
              }
            </select>
          </div>
          <div class="mv-field">
            <label for="scope-type">Tipo de alcance</label>
            <select id="scope-type" formControlName="scope_type">
              <option value="BRANCH">Sucursal</option>
              <option value="GLOBAL">Global</option>
            </select>
          </div>
          @if (form.controls.scope_type.value === 'BRANCH') {
            <div class="mv-field">
              <label for="scope-branch">Sucursal</label>
              <select id="scope-branch" formControlName="branch_public_id">
                <option value="">Selecciona</option>
                @for (branch of branches(); track branch.id) {
                  <option [value]="branch.id">{{ branch.name }}</option>
                }
              </select>
            </div>
          }
          <mv-action-button buttonType="submit" [pending]="pending()" [disabled]="form.invalid">
            Asignar alcance
          </mv-action-button>
        </form>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScopeFormPageComponent {
  private readonly api = inject(OrganizationApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  readonly users = signal<readonly OrganizationUserOption[]>([]);
  readonly roles = signal<readonly RoleOption[]>([]);
  readonly branches = signal<readonly BranchOption[]>([]);
  readonly loading = signal(true);
  readonly pending = signal(false);
  readonly message = signal<string | null>(null);
  readonly form = new FormGroup({
    user_public_id: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    role_id: new FormControl<number | null>(null, { validators: [Validators.required] }),
    scope_type: new FormControl<'BRANCH' | 'GLOBAL'>('BRANCH', { nonNullable: true }),
    branch_public_id: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    forkJoin({
      users: this.api.users(),
      roles: this.api.roles(),
      branches: this.api.branches(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError | Error) => {
          this.loading.set(false);
          this.message.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe(({ users, roles, branches }) => {
        this.loading.set(false);
        this.users.set(users);
        this.roles.set(roles);
        this.branches.set(branches);
      });
  }

  submit(): void {
    if (this.form.invalid || this.pending()) return;
    const value = this.form.getRawValue();
    if (value.scope_type === 'BRANCH' && !value.branch_public_id) {
      this.form.controls.branch_public_id.setErrors({ required: true });
      return;
    }
    this.pending.set(true);
    this.api
      .createScope({
        user_public_id: value.user_public_id,
        role_id: value.role_id!,
        scope_type: value.scope_type,
        branch_public_id: value.scope_type === 'GLOBAL' ? null : value.branch_public_id,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.pending.set(false);
          this.message.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.pending.set(false);
        void this.router.navigate(['/administrativa/organizacion/alcances']);
      });
  }
}
