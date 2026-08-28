import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthFacade } from '../../state/auth.facade';
import { MfaMethod } from '../../data-access/auth.dtos';
import { InputErrorComponent } from '../../../../shared/components/inputs/input-error/input-error.component';

@Component({
  selector: 'app-totp',
  imports: [ReactiveFormsModule, InputErrorComponent],
  templateUrl: './totp.html',
})
export class Totp implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  readonly isLoading = this.authFacade.isLoading;
  readonly error = this.authFacade.error;
  readonly availableMfa = this.authFacade.availableMfa;
  readonly mfaStep = this.authFacade.mfaStep;
  readonly mfaExpiresAt = this.authFacade.mfaExpiresAt;
  readonly developmentMfaBypass = this.authFacade.developmentMfaBypass;
  readonly selectedFactor = signal<Extract<MfaMethod, 'TOTP' | 'RECOVERY_CODE'>>('TOTP');
  readonly timeLeftFormatted = signal('');
  readonly expired = signal(false);

  readonly mfaForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (!this.authFacade.mfaChallengeToken()) {
      void this.router.navigate(['/auth/login']);
      return;
    }

    const initialFactor = this.availableMfa().includes('TOTP')
      ? 'TOTP'
      : this.availableMfa().includes('RECOVERY_CODE')
        ? 'RECOVERY_CODE'
        : 'TOTP';
    this.selectFactor(initialFactor);
    this.updateTimer();
    this.intervalId = setInterval(() => this.updateTimer(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  selectFactor(factor: Extract<MfaMethod, 'TOTP' | 'RECOVERY_CODE'>): void {
    this.selectedFactor.set(factor);
    const code = this.mfaForm.controls.code;
    code.setValue('');
    code.setValidators(
      factor === 'TOTP'
        ? [Validators.required, Validators.pattern(/^\d{6}$/)]
        : [Validators.required],
    );
    code.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    if (this.mfaForm.invalid || this.isLoading() || this.expired()) {
      this.mfaForm.markAllAsTouched();
      return;
    }

    const code = this.mfaForm.getRawValue().code.trim();
    await this.authFacade.verifyMfa(
      this.selectedFactor() === 'TOTP' ? { totp_code: code } : { recovery_code: code },
    );
  }

  usePasskey(): void {
    void this.authFacade.verifyPasskeyMfa();
  }

  skipFactor(factor: 'TOTP' | 'PASSKEY'): void {
    void this.authFacade.skipDevelopmentMfa(factor);
  }

  private updateTimer(): void {
    const expiresAt = this.mfaExpiresAt();
    if (!expiresAt) {
      this.timeLeftFormatted.set('');
      return;
    }

    const remainingSeconds = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    this.expired.set(remainingSeconds === 0);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    this.timeLeftFormatted.set(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }
}
