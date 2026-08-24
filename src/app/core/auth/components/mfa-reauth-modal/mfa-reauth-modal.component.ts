import { Component, inject } from '@angular/core';
import { MfaReauthService } from '../../services/mfa-reauth.service';

@Component({
  selector: 'app-mfa-reauth-modal',
  standalone: true,
  imports: [],
  template: `
    @if (mfaReauthService.isModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
           role="dialog" aria-modal="true" aria-labelledby="mfa-reauth-title">
        <div class="m-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <div class="mb-4 flex items-center gap-3 text-amber-600">
            <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 id="mfa-reauth-title" class="text-xl font-bold text-gray-800">Reautenticación requerida</h2>
          </div>

          <p class="mb-6 text-sm text-gray-600">Ingrese el código TOTP actual para confirmar esta acción sensible.</p>

          <label for="mfa-reauth-code" class="mb-2 block text-sm font-medium text-gray-700">Código de 6 dígitos</label>
          <input id="mfa-reauth-code" type="text" [value]="code" inputmode="numeric"
                 autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6"
                 placeholder="123456" aria-describedby="mfa-reauth-help"
                 class="mb-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                 (input)="onCodeInput($event)" (keyup.enter)="submit()">
          <p id="mfa-reauth-help" class="mb-6 text-xs text-gray-500">Solo números; el código debe contener exactamente 6 dígitos.</p>

          <div class="flex justify-end gap-3">
            <button type="button" (click)="cancel()" class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200">
              Cancelar
            </button>
            <button type="button" (click)="submit()" [disabled]="!isValidCode"
                    class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50">
              Verificar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class MfaReauthModalComponent {
  readonly mfaReauthService = inject(MfaReauthService);
  code = '';

  get isValidCode(): boolean {
    return /^\d{6}$/.test(this.code);
  }

  normalizeCode(value: string): void {
    this.code = value.replace(/\D/g, '').slice(0, 6);
  }

  onCodeInput(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      this.normalizeCode(input.value);
      input.value = this.code;
    }
  }

  submit(): void {
    if (!this.isValidCode) {
      return;
    }

    this.mfaReauthService.submitCode(this.code);
    this.code = '';
  }

  cancel(): void {
    this.mfaReauthService.cancel();
    this.code = '';
  }
}
