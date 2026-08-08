import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import * as QRCode from 'qrcode';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { SecurityService } from '../../data-access/security.service';
import { PasskeysComponent } from '../passkeys/passkeys.component';

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PasskeysComponent, ReactiveFormsModule],
  templateUrl: './mfa.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MfaComponent implements OnDestroy {
  private readonly securityService = inject(SecurityService);

  readonly isTotpModalOpen = signal(false);
  readonly totpStep = signal<'validate' | 'setup'>('validate');
  readonly isProcessing = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly qrCodeUrl = signal('');
  readonly secret = signal('');
  readonly isSecretVisible = signal(false);

  readonly validateForm = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{6}$/)] }),
  });
  readonly setupForm = new FormGroup({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{6}$/)] }),
  });

  ngOnDestroy(): void { this.clearSecrets(); }

  openTotpModal(): void {
    this.isTotpModalOpen.set(true);
    this.totpStep.set('validate');
    this.validateForm.reset();
    this.setupForm.reset();
    this.error.set('');
    this.success.set('');
    this.clearSecrets();
  }

  closeTotpModal(): void {
    this.isTotpModalOpen.set(false);
    this.validateForm.reset();
    this.setupForm.reset();
    this.clearSecrets();
  }

  async validateCurrent(): Promise<void> {
    if (this.validateForm.invalid) {
      this.validateForm.markAllAsTouched();
      return;
    }

    this.isProcessing.set(true);
    this.error.set('');
    try {
      const credentials = this.validateForm.getRawValue();
      await firstValueFrom(this.securityService.validateCurrentTotp({
        current_password: credentials.password,
        totp_code: credentials.code,
      }));
      const data = await firstValueFrom(this.securityService.getTotpSetup());
      this.secret.set(data.totp_secret);
      this.qrCodeUrl.set(await QRCode.toDataURL(data.totp_uri, { margin: 1, width: 256 }));
      this.totpStep.set('setup');
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible validar la contraseña y el código TOTP actuales.'));
    } finally {
      this.isProcessing.set(false);
    }
  }

  async confirmNewTotp(): Promise<void> {
    if (this.setupForm.invalid) {
      this.setupForm.markAllAsTouched();
      return;
    }

    this.isProcessing.set(true);
    this.error.set('');
    try {
      const response = await firstValueFrom(this.securityService.confirmTotpSetup({
        current_password: this.validateForm.controls.password.value,
        new_totp_code: this.setupForm.controls.code.value,
      }));
      this.closeTotpModal();
      this.success.set(response.message);
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible confirmar el nuevo código TOTP.'));
    } finally {
      this.isProcessing.set(false);
    }
  }

  toggleSecretVisibility(): void {
    this.isSecretVisible.update((visible) => !visible);
  }

  private clearSecrets(): void {
    this.qrCodeUrl.set('');
    this.secret.set('');
    this.isSecretVisible.set(false);
  }
}
