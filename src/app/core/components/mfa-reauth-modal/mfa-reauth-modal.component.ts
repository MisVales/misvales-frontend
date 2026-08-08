import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MfaReauthService } from '../../services/mfa-reauth.service';

@Component({
  selector: 'app-mfa-reauth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (mfaReauthService.isModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
          <div class="flex items-center gap-3 mb-4 text-amber-600">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 class="text-xl font-bold text-gray-800">Reautenticación Requerida</h2>
          </div>
          <p class="text-gray-600 text-sm mb-6">Por seguridad, ingrese un código TOTP actual para confirmar esta acción.</p>
          
          <input type="text" [(ngModel)]="code" placeholder="123456" 
                 class="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-[0.5em] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all mb-6"
                 maxlength="6" (keyup.enter)="submit()">
                 
          <div class="flex justify-end gap-3">
            <button (click)="cancel()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm">
              Cancelar
            </button>
            <button (click)="submit()" [disabled]="!code || code.length < 6" class="px-4 py-2 text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-sm">
              Verificar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class MfaReauthModalComponent {
  mfaReauthService = inject(MfaReauthService);
  code = '';

  submit() {
    if (this.code && this.code.length >= 6) {
      this.mfaReauthService.submitCode(this.code);
      this.code = '';
    }
  }

  cancel() {
    this.mfaReauthService.cancel();
    this.code = '';
  }
}
