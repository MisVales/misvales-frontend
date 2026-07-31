import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { ActionButtonComponent } from '@shared/components/action-button.component';
import { FeedbackMessageComponent } from '@shared/components/feedback-message.component';

import { AuthApiService } from '../data-access/auth-api.service';

@Component({
  selector: 'mv-recovery-request-page',
  imports: [ActionButtonComponent, FeedbackMessageComponent, ReactiveFormsModule, RouterLink],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Recuperación</p>
      <h2>Recuperar contraseña</h2>
      @if (sent()) {
        <mv-feedback-message
          kind="success"
          message="Si la información corresponde a una cuenta elegible, recibirás instrucciones de recuperación."
        />
        <a routerLink="/acceso">Volver al acceso</a>
      } @else {
        <p>Escribe el correo asociado a tu cuenta.</p>
        @if (message()) {
          <mv-feedback-message kind="error" [message]="message()!" />
        }
        <form class="mv-form" (submit)="submit($event)">
          <div class="mv-field">
            <label for="recovery-email">Correo electrónico</label>
            <input id="recovery-email" type="email" autocomplete="email" [formControl]="email" />
          </div>
          <mv-action-button buttonType="submit" [pending]="pending()" [disabled]="email.invalid">
            Enviar instrucciones
          </mv-action-button>
        </form>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoveryRequestPageComponent {
  private readonly api = inject(AuthApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  readonly pending = signal(false);
  readonly sent = signal(false);
  readonly message = signal<string | null>(null);

  submit(event: Event): void {
    event.preventDefault();
    if (this.email.invalid || this.pending()) {
      return;
    }
    this.pending.set(true);
    this.message.set(null);
    this.api
      .requestRecovery(this.email.value)
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
        this.sent.set(true);
      });
  }
}
