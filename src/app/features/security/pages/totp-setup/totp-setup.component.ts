import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/data-access/auth.service';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { SecurityService } from '../../data-access/security.service';

@Component({
  selector: 'app-totp-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './totp-setup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotpSetupComponent implements OnInit {
  private securityService = inject(SecurityService);
  private authService = inject(AuthService);

  qrCodeUrl = signal('');
  secret = signal('');
  isSecretVisible = signal(false);
  isLoading = signal(true);
  isConfirming = signal(false);
  isRegisteringPasskey = signal(false);
  error = signal('');
  success = signal(false);
  
  form = new FormGroup({
    password: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
  });

  async ngOnInit() {
    try {
      const data = await firstValueFrom(this.securityService.getTotpSetup());
      this.secret.set(data.totp_secret);
      // Generate a QR code using an external service
      this.qrCodeUrl.set(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.totp_uri)}`);
    } catch (err) {
      this.error.set('No se pudo cargar la configuración TOTP.');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleSecretVisibility() {
    this.isSecretVisible.update(v => !v);
  }

  async verifyTotp() {
    if (this.form.invalid) return;
    this.isConfirming.set(true);
    this.error.set('');
    this.success.set(false);
    
    try {
      await firstValueFrom(
        this.securityService.confirmTotpSetup({
          current_password: this.form.value.password,
          new_totp_code: this.form.value.code
        })
      );
      this.success.set(true);
      this.form.reset();
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al verificar el código. Intenta de nuevo.');
    } finally {
      this.isConfirming.set(false);
    }
  }
}
