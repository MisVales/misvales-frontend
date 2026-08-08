import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { SecurityService } from '../../data-access/security.service';
import { startRegistration } from '@simplewebauthn/browser';

@Component({
  selector: 'app-passkeys',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DatePipe],
  templateUrl: './passkeys.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasskeysComponent implements OnInit {
  private securityService = inject(SecurityService);

  passkeys = signal<any[]>([]);
  loading = signal(true);
  error = signal('');
  isRegistering = signal(false);

  showAuthPrompt = signal(false);
  authAction = signal<'register' | 'delete'>('register');
  authPasskeyId = signal<string | null>(null);
  authPassword = signal('');
  authTotp = signal('');
  authLoading = signal(false);
  authError = signal('');

  async ngOnInit() {
    await this.loadPasskeys();
  }

  async loadPasskeys() {
    this.loading.set(true);
    this.error.set('');
    try {
      const response = await firstValueFrom(this.securityService.getPasskeys());
      this.passkeys.set(response);
    } catch (err: any) {
      this.error.set('No se pudieron cargar las llaves de acceso.');
    } finally {
      this.loading.set(false);
    }
  }

  registerPasskey() {
    this.authAction.set('register');
    this.authPassword.set('');
    this.authTotp.set('');
    this.authError.set('');
    this.showAuthPrompt.set(true);
  }

  deletePasskey(id: string) {
    this.authAction.set('delete');
    this.authPasskeyId.set(id);
    this.authPassword.set('');
    this.authTotp.set('');
    this.authError.set('');
    this.showAuthPrompt.set(true);
  }

  cancelAuth() {
    this.showAuthPrompt.set(false);
    this.authPassword.set('');
    this.authTotp.set('');
  }

  async confirmAuth() {
    if (!this.authPassword() || !this.authTotp()) return;
    
    this.authLoading.set(true);
    this.authError.set('');
    try {
      await firstValueFrom(this.securityService.validateCurrentTotp({
        current_password: this.authPassword(),
        totp_code: this.authTotp()
      }));
      
      this.showAuthPrompt.set(false);
      this.authPassword.set('');
      this.authTotp.set('');
      
      if (this.authAction() === 'register') {
        await this.executeRegisterPasskey();
      } else if (this.authAction() === 'delete') {
        await this.executeDeletePasskey(this.authPasskeyId()!);
      }
    } catch (err: any) {
      this.authError.set(err?.error?.message || 'Contraseña o código TOTP incorrectos.');
    } finally {
      this.authLoading.set(false);
    }
  }

  async executeRegisterPasskey() {
    this.error.set('');
    this.isRegistering.set(true);
    try {
      const options = await firstValueFrom(this.securityService.registerPasskeyOptions());
      
      let attResp;
      try {
        attResp = await startRegistration({ optionsJSON: options });
      } catch (err: any) {
        this.isRegistering.set(false);
        return; // Usuario canceló
      }

      await firstValueFrom(this.securityService.registerPasskeyConfirm({
        clientDataJSON: (attResp.response as any).clientDataJSON,
        attestationObject: (attResp.response as any).attestationObject
      }));

      await this.loadPasskeys();
    } catch (err: any) {
      const fallback = err?.error?.message || 'Error al registrar Passkey.';
      this.error.set(fallback);
      alert(fallback);
    } finally {
      this.isRegistering.set(false);
    }
  }

  async executeDeletePasskey(id: string) {
    this.error.set('');
    try {
      await firstValueFrom(this.securityService.deletePasskey(id));
      this.passkeys.update(pk => pk.filter(p => p.id !== id));
    } catch (err: any) {
      const fallback = err?.error?.message || 'Error al eliminar la llave de acceso.';
      alert(fallback);
    }
  }
}
