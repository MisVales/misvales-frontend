import { CdkTrapFocus } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import { afterRenderEffect, Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthTokenStore } from '../../session/auth-token.store';
import { SessionExpiredService } from '../../session/session-expired.service';
import { SessionStore } from '../../session/session.store';

@Component({
  selector: 'app-session-expired-dialog',
  standalone: true,
  imports: [CdkTrapFocus],
  template: `
    @if (sessionExpired.isOpen()) {
      <div
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
        (keydown.escape)="keepOpen($event)"
      >
        <section
          cdkTrapFocus
          [cdkTrapFocusAutoCapture]="true"
          class="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-expired-title"
          aria-describedby="session-expired-description"
        >
          <h2 id="session-expired-title" class="text-2xl font-bold text-slate-900">
            Sesión caducada
          </h2>
          <p id="session-expired-description" class="mt-4 text-sm leading-6 text-slate-600">
            Tu sesión ha caducado por inactividad. Para proteger tu información, inicia sesión
            nuevamente.
          </p>
          <button
            #primaryAction
            autofocus
            type="button"
            class="mt-7 min-h-11 rounded-lg bg-[#1A4D2E] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#133c23] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A4D2E] focus-visible:ring-offset-2"
            (click)="goToLogin()"
          >
            Iniciar sesión
          </button>
        </section>
      </div>
    }
  `,
})
export class SessionExpiredDialogComponent {
  protected readonly sessionExpired = inject(SessionExpiredService);

  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly sessionStore = inject(SessionStore);
  private readonly tokenStore = inject(AuthTokenStore);
  private readonly primaryAction = viewChild<ElementRef<HTMLButtonElement>>('primaryAction');

  constructor() {
    afterRenderEffect(() => {
      if (this.sessionExpired.isOpen()) {
        this.primaryAction()?.nativeElement.focus();
      }
    });

    effect((onCleanup) => {
      if (!this.sessionExpired.isOpen()) {
        return;
      }

      const previousOverflow = this.document.body.style.overflow;
      this.document.body.style.overflow = 'hidden';
      onCleanup(() => {
        this.document.body.style.overflow = previousOverflow;
      });
    });
  }

  protected keepOpen(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  protected goToLogin(): void {
    this.tokenStore.clear();
    this.sessionStore.clearSession();
    this.sessionExpired.close();
    void this.router.navigate(['/auth/login']);
  }
}
