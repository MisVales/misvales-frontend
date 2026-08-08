import { ChangeDetectionStrategy, Component, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { SecurityService } from '../../data-access/security.service';

@Component({
  selector: 'app-recovery-codes',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './recovery-codes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecoveryCodesComponent {
  private securityService = inject(SecurityService);

  codes = signal<string[]>([]);
  hasConfirmedSaved = signal(false);
  hasCopied = signal(false);
  
  loading = signal(false);
  error = signal('');
  currentPassword = signal('');
  isGenerating = signal(false);

  startGeneration() {
    this.isGenerating.set(true);
    this.error.set('');
  }

  async generateCodes() {
    if (!this.currentPassword()) {
      this.error.set('Por favor, ingresa tu contraseña actual.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      // Si el backend requiere MFA, devolverá 403 y el interceptor abrirá el modal y agregará el totp_code
      const response = await firstValueFrom(
        this.securityService.regenerateRecoveryCodes({
          current_password: this.currentPassword()
        })
      );
      this.codes.set(response.recovery_codes);
      this.isGenerating.set(false);
      this.currentPassword.set('');
    } catch (err: any) {
      this.error.set(err.error?.message || 'Error al generar códigos de recuperación. Verifica tu contraseña.');
    } finally {
      this.loading.set(false);
    }
  }

  copyCodes() {
    const text = this.codes().join('\n');
    navigator.clipboard.writeText(text).then(() => {
      this.hasCopied.set(true);
      setTimeout(() => this.hasCopied.set(false), 3000);
    });
  }

  canLeave(): boolean {
    if (this.codes().length === 0 || this.hasConfirmedSaved()) {
      return true;
    }
    return window.confirm('No has confirmado que guardaste los códigos. ¿Seguro que quieres salir? Si los pierdes, podrías perder acceso a tu cuenta de forma permanente.');
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.codes().length > 0 && !this.hasConfirmedSaved()) {
      $event.returnValue = true;
    }
  }
}
