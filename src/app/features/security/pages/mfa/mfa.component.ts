import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { PasskeysComponent } from '../passkeys/passkeys.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SecurityService } from '../../data-access/security.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PasskeysComponent, ReactiveFormsModule],
  templateUrl: './mfa.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MfaComponent {
  private securityService = inject(SecurityService);
  private fb = inject(FormBuilder);

  isTotpModalOpen = signal(false);
  totpStep = signal<'validate' | 'setup'>('validate'); // validate current vs setup new
  isProcessing = signal(false);
  error = signal('');
  
  // Validation form
  validateForm: FormGroup = this.fb.group({
    password: ['', Validators.required],
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  // Setup form
  setupForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  qrCodeUrl = signal('');
  secret = signal('');
  isSecretVisible = signal(false);

  openTotpModal() {
    this.isTotpModalOpen.set(true);
    this.totpStep.set('validate');
    this.validateForm.reset();
    this.setupForm.reset();
    this.error.set('');
  }

  closeTotpModal() {
    this.isTotpModalOpen.set(false);
  }

  async validateCurrent() {
    if (this.validateForm.invalid) return;
    this.isProcessing.set(true);
    this.error.set('');
    
    try {
      await firstValueFrom(this.securityService.validateCurrentTotp({
        current_password: this.validateForm.value.password,
        totp_code: this.validateForm.value.code
      }));
      
      // Validation successful, fetch new TOTP setup
      const data = await firstValueFrom(this.securityService.getTotpSetup());
      this.secret.set(data.totp_secret);
      this.qrCodeUrl.set(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.totp_uri)}`);
      
      this.totpStep.set('setup');
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al validar. Verifique su contraseña y código actual.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  async confirmNewTotp() {
    if (this.setupForm.invalid) return;
    this.isProcessing.set(true);
    this.error.set('');
    
    try {
      await firstValueFrom(this.securityService.confirmTotpSetup({
        current_password: this.validateForm.value.password, // Reusing validated password
        new_totp_code: this.setupForm.value.code
      }));
      
      this.closeTotpModal();
      alert('Autenticación TOTP cambiada exitosamente.');
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al confirmar el nuevo código.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  toggleSecretVisibility() {
    this.isSecretVisible.update(v => !v);
  }
}
