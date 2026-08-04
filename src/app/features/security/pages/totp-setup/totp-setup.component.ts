import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/data-access/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-totp-setup',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './totp-setup.component.html',
  styleUrl: './totp-setup.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotpSetupComponent {
  private authService = inject(AuthService);

  qrCodeUrl = signal('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/App:user@example.com?secret=JBSWY3DPEHPK3PXP');
  secret = signal('JBSWY3DPEHPK3PXP');
  isSecretVisible = signal(false);
  isLoading = signal(false);
  isRegisteringPasskey = signal(false);
  
  form = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
  });

  toggleSecretVisibility() {
    this.isSecretVisible.update(v => !v);
  }

  verifyTotp() {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    
    // Simulate HTTP request
    setTimeout(() => {
      this.isLoading.set(false);
      alert('TOTP Configurado con éxito');
    }, 1500);
  }

  async registerPasskey() {
    this.isRegisteringPasskey.set(true);
    try {
      const challenge = await firstValueFrom(this.authService.getWebAuthnRegisterChallenge());
      const credential = { id: 'mock-passkey-id', rawId: 'mock-passkey-id', type: 'public-key' };
      await firstValueFrom(this.authService.registerWebAuthn(credential));
      alert('Passkey registrado con éxito');
    } catch(err) {
      alert('Error registrando Passkey');
    } finally {
      this.isRegisteringPasskey.set(false);
    }
  }
}
