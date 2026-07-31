import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { UiStateComponent } from '@shared/components/ui-state.component';

import { AuthApiService } from '../data-access/auth-api.service';
import { AuthFlowStore } from '../state/auth-flow.store';

@Component({
  selector: 'mv-invitation-page',
  imports: [DatePipe, RouterLink, UiStateComponent],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Invitación</p>
      <h2>Activar cuenta</h2>
      @if (loading()) {
        <mv-ui-state kind="loading" message="Validando la invitación…" />
      } @else if (error()) {
        <mv-ui-state kind="error" [message]="error()" />
      } @else if (invitation()) {
        <dl class="mv-summary">
          <div>
            <dt>Nombre</dt>
            <dd>{{ invitation()!.account.name }}</dd>
          </div>
          <div>
            <dt>Correo</dt>
            <dd>{{ invitation()!.account.email }}</dd>
          </div>
          <div>
            <dt>Vigencia</dt>
            <dd>{{ invitation()!.expires_at | date: 'medium' }}</dd>
          </div>
        </dl>
        <mv-ui-state
          kind="error"
          title="Inscripción MFA no disponible"
          message="El contrato no entrega opciones públicas para generar el secreto TOTP o el desafío de passkey de esta invitación. La activación se mantiene cerrada para no inventar secretos."
        />
      } @else {
        <p>Abre nuevamente el enlace de invitación recibido.</p>
      }
      <a routerLink="/acceso">Volver al acceso</a>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationPageComponent {
  private readonly api = inject(AuthApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly flow = inject(AuthFlowStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly invitation = this.flow.invitation;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.destroyRef.onDestroy(() => this.flow.clearInvitation());
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      return;
    }
    this.loading.set(true);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
    this.api
      .inspectInvitation(token)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.loading.set(false);
          this.error.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe((invitation) => {
        this.loading.set(false);
        this.flow.setInvitation(invitation);
      });
  }
}
