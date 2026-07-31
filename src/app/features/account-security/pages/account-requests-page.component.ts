import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, EMPTY, switchMap } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { SessionStore } from '@core/session/session.store';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';
import { UiStateComponent } from '@shared/components/ui-state.component';

import { ReauthFieldsComponent } from '../components/reauth-fields.component';
import { AccountSecurityApiService } from '../data-access/account-security-api.service';
import { AccountsApiService } from '../data-access/accounts-api.service';
import { AccountRequestDto } from '../models/accounts.models';

@Component({
  selector: 'mv-account-requests-page',
  imports: [
    ActionButtonComponent,
    DatePipe,
    FeedbackMessageComponent,
    ReactiveFormsModule,
    ReauthFieldsComponent,
    RouterLink,
    UiStateComponent,
  ],
  template: `
    <section class="mv-panel wide">
      <p class="mv-eyebrow">Cuentas</p>
      <header>
        <h1>Solicitudes</h1>
        @if (canRequest) {
          <a routerLink="nueva">Nueva solicitud</a>
        }
      </header>
      @if (message()) {
        <mv-feedback-message [kind]="messageKind()" [message]="message()!" />
      }
      @if (loading()) {
        <mv-ui-state kind="loading" message="Consultando solicitudes…" />
      } @else if (requests().length === 0) {
        <mv-ui-state kind="empty" message="No hay solicitudes dentro de tu alcance." />
      } @else {
        <div class="requests">
          @for (request of requests(); track request.public_id) {
            <article>
              <div>
                <h2>{{ request.target_name || 'Cuenta' }}</h2>
                <p>{{ request.target_email }}</p>
                <small
                  >{{ request.type }} · {{ request.state }} ·
                  {{ request.created_at | date: 'medium' }}</small
                >
              </div>
              @if (canDecide && request.state === 'PENDING_APPROVAL') {
                <div class="mv-choice-row">
                  <button type="button" (click)="open(request, 'approve')">Aprobar</button>
                  <button type="button" (click)="open(request, 'reject')">Rechazar</button>
                </div>
              }
            </article>
          }
        </div>
        <nav class="pagination" aria-label="Paginación de solicitudes">
          <button type="button" [disabled]="!previousUrl()" (click)="move(previousUrl())">
            Anterior
          </button>
          <span>Página {{ page() }}</span>
          <button type="button" [disabled]="!nextUrl()" (click)="move(nextUrl())">Siguiente</button>
        </nav>
      }
      @if (selected()) {
        <form class="mv-form decision" [formGroup]="form" (ngSubmit)="decide()">
          <h2>{{ decision() === 'approve' ? 'Aprobar solicitud' : 'Rechazar solicitud' }}</h2>
          <div class="mv-field">
            <label for="decision-reason">Motivo</label>
            <textarea id="decision-reason" formControlName="reason"></textarea>
          </div>
          <mv-reauth-fields [password]="form.controls.password" [totp]="form.controls.totp_code" />
          <div class="mv-choice-row">
            <button type="button" (click)="cancel()">Cancelar</button>
            <mv-action-button buttonType="submit" [pending]="pending()" [disabled]="form.invalid">
              Confirmar
            </mv-action-button>
          </div>
        </form>
      }
    </section>
  `,
  styles: `
    .wide {
      width: min(100%, 64rem);
    }
    header,
    article,
    .pagination {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      align-items: center;
    }
    .requests {
      display: grid;
      gap: 0.7rem;
    }
    article,
    .decision {
      border: 1px solid var(--mv-gray);
      border-radius: 0.7rem;
      padding: 1rem;
    }
    article h2 {
      font-size: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountRequestsPageComponent {
  private readonly accounts = inject(AccountsApiService);
  private readonly security = inject(AccountSecurityApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly session = inject(SessionStore);
  readonly requests = signal<readonly AccountRequestDto[]>([]);
  readonly selected = signal<AccountRequestDto | null>(null);
  readonly decision = signal<'approve' | 'reject'>('approve');
  readonly loading = signal(true);
  readonly pending = signal(false);
  readonly message = signal<string | null>(null);
  readonly messageKind = signal<'error' | 'success'>('success');
  readonly page = signal(1);
  readonly previousUrl = signal<string | null>(null);
  readonly nextUrl = signal<string | null>(null);
  readonly canRequest = this.session.hasPermission('accounts.branch.request');
  readonly canDecide = this.session.hasPermission('accounts.global.approve');
  readonly form = new FormGroup({
    reason: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    totp_code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.load();
  }

  open(request: AccountRequestDto, decision: 'approve' | 'reject'): void {
    this.selected.set(request);
    this.decision.set(decision);
    this.form.reset();
  }

  cancel(): void {
    this.selected.set(null);
    this.form.reset();
  }

  decide(): void {
    const selected = this.selected();
    const access = this.session.access();
    if (!selected || !access || this.form.invalid || this.pending()) return;
    this.pending.set(true);
    const value = this.form.getRawValue();
    const action =
      this.decision() === 'approve' ? 'account_requests.approve' : 'account_requests.reject';
    this.security
      .reauthenticate({
        method: 'PASSWORD_TOTP',
        action,
        resource_type: 'account_requests',
        resource_id: selected.public_id,
        branch_id: access.branchId ?? null,
        parameters: {},
        reason: value.reason,
        password: value.password,
        totp_code: value.totp_code,
      })
      .pipe(
        switchMap((authorization) =>
          this.accounts.decide(
            selected.public_id,
            this.decision(),
            value.reason,
            authorization.authorization_token,
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.pending.set(false);
          this.messageKind.set('error');
          this.message.set(error.message);
          if (error.status === 409) {
            this.cancel();
            this.load();
          }
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.pending.set(false);
        this.cancel();
        this.messageKind.set('success');
        this.message.set('La solicitud fue decidida por el backend.');
        this.load();
      });
  }

  move(url: string | null): void {
    if (!url || this.loading()) return;
    this.load(url);
  }

  private load(navigationUrl: string | null = null): void {
    this.loading.set(true);
    this.accounts
      .accountRequests(navigationUrl)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError | Error) => {
          this.loading.set(false);
          this.messageKind.set('error');
          this.message.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe((response) => {
        this.loading.set(false);
        this.requests.set(response.data);
        this.page.set(response.meta.current_page);
        this.previousUrl.set(response.links.prev);
        this.nextUrl.set(response.links.next);
      });
  }
}
