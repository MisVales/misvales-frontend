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
import { BranchOption, OrganizationUserOption } from '../models/organization.models';

@Component({
  selector: 'mv-assignment-form-page',
  imports: [ActionButtonComponent, FeedbackMessageComponent, ReactiveFormsModule, UiStateComponent],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Organización</p>
      <h1>Nueva asignación</h1>
      @if (loading()) {
        <mv-ui-state kind="loading" message="Cargando usuarios y sucursales…" />
      } @else {
        @if (message()) {
          <mv-feedback-message kind="error" [message]="message()!" />
        }
        <form class="mv-form" [formGroup]="form" (ngSubmit)="submit()">
          <div class="mv-field">
            <label for="assignment-distributor">Distribuidora</label>
            <select id="assignment-distributor" formControlName="distributor_public_id">
              <option value="">Selecciona</option>
              @for (user of distributors(); track user.id) {
                <option [value]="user.id">{{ user.name }} · {{ user.email }}</option>
              }
            </select>
          </div>
          <div class="mv-field">
            <label for="assignment-coordinator">Coordinador</label>
            <select id="assignment-coordinator" formControlName="coordinator_public_id">
              <option value="">Selecciona</option>
              @for (user of coordinators(); track user.id) {
                <option [value]="user.id">{{ user.name }} · {{ user.email }}</option>
              }
            </select>
          </div>
          <div class="mv-field">
            <label for="assignment-branch">Sucursal</label>
            <select id="assignment-branch" formControlName="branch_public_id">
              <option value="">Selecciona</option>
              @for (branch of branches(); track branch.id) {
                <option [value]="branch.id">{{ branch.name }}</option>
              }
            </select>
          </div>
          <div class="mv-field">
            <label for="assignment-start">Inicio</label>
            <input id="assignment-start" type="datetime-local" formControlName="starts_at" />
          </div>
          <div class="mv-field">
            <label for="assignment-end">Fin opcional</label>
            <input id="assignment-end" type="datetime-local" formControlName="ends_at" />
          </div>
          <div class="mv-field">
            <label for="assignment-reason">Motivo opcional</label>
            <textarea id="assignment-reason" formControlName="reason"></textarea>
          </div>
          <mv-action-button buttonType="submit" [pending]="pending()" [disabled]="form.invalid">
            Crear asignación
          </mv-action-button>
        </form>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentFormPageComponent {
  private readonly api = inject(OrganizationApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  readonly distributors = signal<readonly OrganizationUserOption[]>([]);
  readonly coordinators = signal<readonly OrganizationUserOption[]>([]);
  readonly branches = signal<readonly BranchOption[]>([]);
  readonly loading = signal(true);
  readonly pending = signal(false);
  readonly message = signal<string | null>(null);
  readonly form = new FormGroup({
    distributor_public_id: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    coordinator_public_id: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    branch_public_id: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    starts_at: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    ends_at: new FormControl('', { nonNullable: true }),
    reason: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    forkJoin({ users: this.api.users(), branches: this.api.branches() })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError | Error) => {
          this.loading.set(false);
          this.message.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe(({ users, branches }) => {
        this.loading.set(false);
        this.distributors.set(users.filter((user) => user.roleCode === 'DISTRIBUTOR'));
        this.coordinators.set(users.filter((user) => user.roleCode === 'COORDINATOR'));
        this.branches.set(branches);
      });
  }

  submit(): void {
    if (this.form.invalid || this.pending()) return;
    this.pending.set(true);
    const value = this.form.getRawValue();
    this.api
      .createAssignment({
        distributor_public_id: value.distributor_public_id,
        coordinator_public_id: value.coordinator_public_id,
        branch_public_id: value.branch_public_id,
        starts_at: new Date(value.starts_at).toISOString(),
        ends_at: value.ends_at ? new Date(value.ends_at).toISOString() : null,
        reason: value.reason || null,
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
        void this.router.navigate(['/administrativa/organizacion/asignaciones']);
      });
  }
}
