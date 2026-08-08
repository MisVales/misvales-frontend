import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthFacade } from '../../state/auth.facade';

@Component({
  selector: 'app-totp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#F8F9FA] flex flex-col relative font-sans">
      <div class="flex-grow flex items-center justify-center p-4">
        <div class="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full border border-gray-100 text-center relative">
          
          <div class="absolute top-4 right-4 text-gray-500 font-mono text-sm font-medium flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100" *ngIf="timeLeftFormatted()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ timeLeftFormatted() }}
          </div>
          <ng-container *ngIf="mfaStep() === 'totp'">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-[#386641] mb-2">Verificación de Seguridad</h1>
            <p class="text-gray-600 text-sm mb-6">Tu cuenta está protegida. Por favor verifica tu identidad para continuar.</p>

            <div *ngIf="error()" class="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">
              {{ error() }}
            </div>

            <form [formGroup]="mfaForm" (ngSubmit)="onSubmit()" class="text-left">
              <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Código de Autenticación</label>
                <input type="text" formControlName="code" autocomplete="one-time-code"
                       class="block w-full px-4 py-3 border border-[#B08968]/40 rounded-lg text-gray-900 focus:outline-none focus:border-[#386641] focus:ring-1 focus:ring-[#386641] sm:text-sm text-center tracking-widest font-mono"
                       placeholder="Ej: 123456 o 8z2n-9x1a">
                <div *ngIf="mfaForm.get('code')?.touched && mfaForm.get('code')?.invalid" class="mt-2 text-xs text-red-500">
                  El código es obligatorio.
                </div>
              </div>
              
              <button type="submit" [disabled]="isLoading() || mfaForm.invalid"
                      class="w-full bg-[#386641] hover:bg-[#6A994E] disabled:bg-[#386641]/70 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                <span *ngIf="!isLoading()">Verificar Código</span>
                <span *ngIf="isLoading()">Procesando...</span>
              </button>
            </form>
          </ng-container>

          <ng-container *ngIf="mfaStep() === 'passkey'">
            <div class="mb-6">
              <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-gray-800">¡Código Correcto!</h2>
              <p class="text-gray-500 text-sm mt-2">Ahora debes verificar tu Passkey para entrar a tu cuenta de forma segura.</p>
            </div>
            
            <div *ngIf="error()" class="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">
              {{ error() }}
            </div>

            <button (click)="usePasskey()" [disabled]="isLoading()"
                    class="w-full bg-[#386641] hover:bg-[#6A994E] text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md mb-6 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              <span *ngIf="!isLoading()">Verificar Passkey (Huella/Rostro)</span>
              <span *ngIf="isLoading()">Procesando...</span>
            </button>
          </ng-container>

        </div>
      </div>
    </div>
  `
})
export class Totp implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);

  isLoading = this.authFacade.isLoading;
  error = this.authFacade.error;
  availableMfa = this.authFacade.availableMfa;
  mfaStep = this.authFacade.mfaStep;
  mfaExpiresAt = this.authFacade.mfaExpiresAt;

  timeLeftFormatted = signal<string>('');
  private intervalId: any;

  mfaForm = this.fb.group({
    code: ['', Validators.required]
  });

  ngOnInit() {
    this.updateTimer();
    this.intervalId = setInterval(() => this.updateTimer(), 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateTimer() {
    const expiresAt = this.mfaExpiresAt();
    if (!expiresAt) {
      this.timeLeftFormatted.set('');
      return;
    }

    const now = Date.now();
    const diff = expiresAt - now;

    if (diff <= 0) {
      this.timeLeftFormatted.set('0:00');
    } else {
      const seconds = Math.floor(diff / 1000);
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      this.timeLeftFormatted.set(`${m}:${s.toString().padStart(2, '0')}`);
    }
  }

  async onSubmit() {
    if (this.mfaForm.valid && !this.isLoading()) {
      const code = this.mfaForm.value.code?.trim() || '';
      // Si son exactamente 6 números, asumimos TOTP. Si no, asumimos código de recuperación.
      const isRecovery = !/^\d{6}$/.test(code);
      
      await this.authFacade.verifyMfa({
        totp_code: isRecovery ? undefined : code,
        recovery_code: isRecovery ? code : undefined
      });

      // Automatically trigger passkey if the backend requested it
      if (this.authFacade.mfaStep() === 'passkey' && !this.authFacade.error()) {
        this.usePasskey();
      }
    }
  }

  usePasskey() {
    this.authFacade.verifyPasskeyMfa();
  }
}
