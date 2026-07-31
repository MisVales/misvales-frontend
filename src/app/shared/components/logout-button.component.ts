import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';

import { NormalizedApiError } from '@core/api/api-response.models';
import { LogoutService } from '@core/session/logout.service';

@Component({
  selector: 'mv-logout-button',
  template: `
    <button type="button" [disabled]="pending()" (click)="logout()">Cerrar sesión</button>
    @if (message()) {
      <span role="alert">{{ message() }}</span>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 0.25rem;
    }
    button {
      min-height: 44px;
    }
    span {
      max-width: 18rem;
      color: var(--mv-danger);
      font-size: 0.8rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutButtonComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(LogoutService);
  readonly pending = signal(false);
  readonly message = signal<string | null>(null);

  logout(): void {
    if (this.pending()) return;
    this.pending.set(true);
    this.message.set(null);
    this.service
      .logout()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: NormalizedApiError) => {
          this.pending.set(false);
          this.message.set(error.message);
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
