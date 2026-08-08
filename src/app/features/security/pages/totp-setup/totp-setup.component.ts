import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import * as QRCode from 'qrcode';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { SecurityService } from '../../data-access/security.service';

@Component({
  selector: 'app-totp-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './totp-setup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotpSetupComponent implements OnInit, OnDestroy {
  private readonly securityService = inject(SecurityService);

  readonly qrCodeUrl = signal('');
  readonly secret = signal('');
  readonly isSecretVisible = signal(false);
  readonly isLoading = signal(true);
  readonly isConfirming = signal(false);
  readonly isRegisteringPasskey = signal(false);
  readonly error = signal('');
  readonly success = signal(false);

  readonly form = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{6}$/)],
    }),
  });

  async ngOnInit(): Promise<void> {
    try {
      const data = await firstValueFrom(this.securityService.getTotpSetup());
      this.secret.set(data.totp_secret);
      this.qrCodeUrl.set(await QRCode.toDataURL(data.totp_uri, { margin: 1, width: 256 }));
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No se pudo cargar la configuración TOTP.'));
    } finally {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.secret.set('');
    this.qrCodeUrl.set('');
    this.form.reset();
  }

  toggleSecretVisibility(): void {
    this.isSecretVisible.update((visible) => !visible);
  }

  async verifyTotp(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isConfirming.set(true);
    this.error.set('');
    this.success.set(false);
    try {
      const value = this.form.getRawValue();
      await firstValueFrom(this.securityService.confirmTotpSetup({
        current_password: value.password,
        new_totp_code: value.code,
      }));
      this.success.set(true);
      this.secret.set('');
      this.qrCodeUrl.set('');
      this.form.reset();
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible verificar el código TOTP.'));
    } finally {
      this.isConfirming.set(false);
    }
  }
}
