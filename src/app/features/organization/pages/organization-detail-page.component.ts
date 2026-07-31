import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { SessionStore } from '@core/session/session.store';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';
import { UiStateComponent } from '@shared/components/ui-state.component';

import { OrganizationApiService } from '../data-access/organization-api.service';
import { OrganizationRecord } from '../models/organization.models';

@Component({
  selector: 'mv-organization-detail-page',
  imports: [
    ActionButtonComponent,
    FeedbackMessageComponent,
    KeyValuePipe,
    ReactiveFormsModule,
    RouterLink,
    UiStateComponent,
  ],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Organización</p>
      @if (loading()) {
        <mv-ui-state kind="loading" message="Consultando detalle…" />
      } @else if (message() && !record()) {
        <mv-ui-state [kind]="notFound() ? 'not-found' : 'error'" [message]="message()!" />
      } @else if (record()) {
        <h1>{{ record()!.title }}</h1>
        <p>{{ record()!.subtitle }}</p>
        @if (message()) {
          <mv-feedback-message [kind]="messageKind()" [message]="message()!" />
        }
        <dl class="mv-summary">
          @for (item of record()!.detail | keyvalue; track item.key) {
            <div>
              <dt>{{ item.key }}</dt>
              <dd>{{ item.value || 'No disponible' }}</dd>
            </div>
          }
        </dl>

        @if (resource === 'roles') {
          <mv-ui-state
            kind="error"
            title="Edición no disponible"
            message="OpenAPI no define el body de PUT /m02/roles/{id}/permissions; la vista permanece de solo lectura."
          />
        }

        @if (resource === 'users' && canManage()) {
          <a routerLink="seguridad">Gestionar seguridad y ciclo de vida</a>
        }

        @if (resource === 'assignments' && canManage()) {
          <form class="mv-form" [formGroup]="assignmentForm" (ngSubmit)="updateAssignment()">
            <h2>Actualizar vigencia</h2>
            <div class="mv-field">
              <label for="assignment-detail-end">Fin opcional</label>
              <input id="assignment-detail-end" type="datetime-local" formControlName="ends_at" />
            </div>
            <div class="mv-field">
              <label for="assignment-detail-reason">Motivo opcional</label>
              <textarea id="assignment-detail-reason" formControlName="reason"></textarea>
            </div>
            <mv-action-button buttonType="submit" [pending]="pending()">
              Guardar cambios
            </mv-action-button>
          </form>

          @if (confirmClose()) {
            <div class="confirmation" role="alertdialog" aria-labelledby="close-assignment-title">
              <h2 id="close-assignment-title">Cerrar asignación</h2>
              <p>La asignación dejará de estar vigente, pero conservará su historial.</p>
              <div class="mv-choice-row">
                <button type="button" (click)="confirmClose.set(false)">Cancelar</button>
                <mv-action-button
                  variant="destructive"
                  [pending]="pending()"
                  (activated)="closeAssignment()"
                >
                  Confirmar cierre
                </mv-action-button>
              </div>
            </div>
          } @else {
            <button type="button" class="danger-link" (click)="confirmClose.set(true)">
              Cerrar asignación
            </button>
          }
        }
      }
      <a routerLink="..">Volver al listado</a>
    </section>
  `,
  styles: `
    .confirmation {
      display: grid;
      gap: 0.75rem;
      border: 1px solid var(--mv-danger);
      border-radius: 0.7rem;
      padding: 1rem;
    }
    .danger-link {
      min-height: 44px;
      color: var(--mv-danger);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationDetailPageComponent {
  private readonly api = inject(OrganizationApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(SessionStore);
  private readonly id =
    this.route.snapshot.paramMap.get(
      this.route.snapshot.data['resource'] === 'roles' ? 'id' : 'uuid',
    ) ?? '';

  readonly resource = this.route.snapshot.data['resource'] as
    'assignments' | 'branches' | 'roles' | 'users';
  readonly record = signal<OrganizationRecord | null>(null);
  readonly loading = signal(true);
  readonly pending = signal(false);
  readonly message = signal<string | null>(null);
  readonly messageKind = signal<'error' | 'success'>('success');
  readonly notFound = signal(false);
  readonly confirmClose = signal(false);
  readonly canManage = computed(() => {
    const role = this.session.access()?.role;
    return role === 'GENERAL_MANAGER' || role === 'SUCURSAL_MANAGER';
  });
  readonly assignmentForm = new FormGroup({
    ends_at: new FormControl('', { nonNullable: true }),
    reason: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    if (!this.id) {
      this.loading.set(false);
      this.notFound.set(true);
      this.message.set('El identificador solicitado no es válido.');
      return;
    }
    this.load();
  }

  updateAssignment(): void {
    if (
      this.resource !== 'assignments' ||
      !this.canManage() ||
      this.pending() ||
      this.assignmentForm.invalid
    ) {
      return;
    }
    this.pending.set(true);
    this.message.set(null);
    const value = this.assignmentForm.getRawValue();
    this.api
      .updateAssignment(this.id, {
        ends_at: value.ends_at ? new Date(value.ends_at).toISOString() : null,
        reason: value.reason || null,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.pending.set(false);
          this.messageKind.set('error');
          this.message.set(error.message);
          if (error.status === 409) this.load();
          return EMPTY;
        }),
      )
      .subscribe((record) => {
        this.pending.set(false);
        this.record.set(record);
        this.patchAssignmentForm(record);
        this.messageKind.set('success');
        this.message.set('La asignación fue actualizada por el backend.');
      });
  }

  closeAssignment(): void {
    if (this.resource !== 'assignments' || !this.canManage() || this.pending()) return;
    this.pending.set(true);
    this.message.set(null);
    this.api
      .closeAssignment(this.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.pending.set(false);
          this.confirmClose.set(false);
          this.messageKind.set('error');
          this.message.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.pending.set(false);
        this.confirmClose.set(false);
        this.messageKind.set('success');
        this.message.set('La asignación fue cerrada y su historial se conservó.');
        this.load(false);
      });
  }

  private load(showLoading = true): void {
    if (showLoading) this.loading.set(true);
    this.api
      .detail(this.resource, this.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError | Error) => {
          this.loading.set(false);
          this.notFound.set('status' in error && error.status === 404);
          this.messageKind.set('error');
          this.message.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe((record) => {
        this.loading.set(false);
        this.record.set(record);
        if (this.resource === 'assignments') this.patchAssignmentForm(record);
      });
  }

  private patchAssignmentForm(record: OrganizationRecord): void {
    this.assignmentForm.setValue({
      ends_at: toLocalDateTime(record.detail['ends_at']),
      reason: record.detail['reason'] ?? '',
    });
  }
}

function toLocalDateTime(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - localOffset).toISOString().slice(0, 16);
}
