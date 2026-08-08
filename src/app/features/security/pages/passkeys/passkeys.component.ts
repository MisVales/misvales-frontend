import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { startRegistration } from '@simplewebauthn/browser';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { PasskeyRes, SecurityService } from '../../data-access/security.service';

@Component({
  selector: 'app-passkeys',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DatePipe],
  templateUrl: './passkeys.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasskeysComponent implements OnInit {
  private readonly securityService = inject(SecurityService);

  readonly passkeys = signal<PasskeyRes[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly isRegistering = signal(false);
  readonly showAuthPrompt = signal(false);
  readonly authAction = signal<'register' | 'delete'>('register');
  readonly authPasskeyId = signal<string | null>(null);
  readonly authPassword = signal('');
  readonly authTotp = signal('');
  readonly authLoading = signal(false);
  readonly authError = signal('');

  async ngOnInit(): Promise<void> {
    await this.loadPasskeys();
  }

  async loadPasskeys(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.passkeys.set(await firstValueFrom(this.securityService.getPasskeys()));
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No se pudieron cargar las llaves de acceso.'));
    } finally {
      this.loading.set(false);
    }
  }

  registerPasskey(): void {
    this.openAuthPrompt('register');
  }

  deletePasskey(id: string): void {
    this.openAuthPrompt('delete', id);
  }

  cancelAuth(): void {
    this.showAuthPrompt.set(false);
    this.clearAuthSecrets();
  }

  async confirmAuth(): Promise<void> {
    const password = this.authPassword();
    const code = this.authTotp();
    if (!password || !/^\d{6}$/.test(code)) {
      this.authError.set('Ingrese la contraseña actual y un código TOTP de exactamente 6 dígitos.');
      return;
    }

    this.authLoading.set(true);
    this.authError.set('');
    try {
      await firstValueFrom(this.securityService.validateCurrentTotp({
        current_password: password,
        totp_code: code,
      }));

      const action = this.authAction();
      const passkeyId = this.authPasskeyId();
      this.showAuthPrompt.set(false);
      this.clearAuthSecrets();

      if (action === 'register') await this.executeRegisterPasskey();
      if (action === 'delete' && passkeyId) await this.executeDeletePasskey(passkeyId);
    } catch (error: unknown) {
      this.authError.set(apiErrorMessage(error, 'La contraseña o el código TOTP son incorrectos.'));
    } finally {
      this.authLoading.set(false);
    }
  }

  async executeRegisterPasskey(): Promise<void> {
    this.error.set('');
    this.success.set('');
    this.isRegistering.set(true);
    try {
      const optionsJSON = await firstValueFrom(this.securityService.registerPasskeyOptions());
      const credential = await startRegistration({ optionsJSON });
      const response = await firstValueFrom(this.securityService.registerPasskeyConfirm({
        clientDataJSON: credential.response.clientDataJSON,
        attestationObject: credential.response.attestationObject,
      }));
      this.success.set(response.message);
      await this.loadPasskeys();
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'El registro de la Passkey fue cancelado o no pudo completarse.'));
    } finally {
      this.isRegistering.set(false);
    }
  }

  async executeDeletePasskey(id: string): Promise<void> {
    this.error.set('');
    this.success.set('');
    try {
      const response = await firstValueFrom(this.securityService.deletePasskey(id));
      this.passkeys.update((passkeys) => passkeys.filter((passkey) => passkey.id !== id));
      this.success.set(response.message);
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible eliminar la llave de acceso.'));
    }
  }

  normalizeTotp(value: string): void {
    this.authTotp.set(value.replace(/\D/g, '').slice(0, 6));
  }

  private openAuthPrompt(action: 'register' | 'delete', passkeyId: string | null = null): void {
    this.authAction.set(action);
    this.authPasskeyId.set(passkeyId);
    this.authError.set('');
    this.clearAuthSecrets();
    this.showAuthPrompt.set(true);
  }

  private clearAuthSecrets(): void {
    this.authPassword.set('');
    this.authTotp.set('');
  }
}
