import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthTokenStore } from '../../../../core/session/auth-token.store';
import { SessionStore } from '../../../../core/session/session.store';
import { firstValueFrom } from 'rxjs';
import { SecurityService } from '../../data-access/security.service';
import { apiErrorMessage } from '../../../../core/api/api-error';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './password-change.html',
})
export class PasswordChange {
  private securityService = inject(SecurityService);
  private router = inject(Router);
  private tokenStore = inject(AuthTokenStore);
  private sessionStore = inject(SessionStore);

  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  touched = signal(false);

  passwordCriteria = computed(() => {
    const pw = this.newPassword();
    return {
      length: pw.length >= 12,
      uppercase: /[A-Z]/.test(pw),
      lowercase: /[a-z]/.test(pw),
      number: /\d/.test(pw),
      symbol: /[@$!%*?&_\-#.+]/.test(pw)
    };
  });

  isPasswordValid = computed(() => {
    const c = this.passwordCriteria();
    return c.length && c.uppercase && c.lowercase && c.number && c.symbol;
  });

  passwordsMismatch = computed(() => {
    return !!this.confirmPassword() && this.newPassword() !== this.confirmPassword();
  });

  loading = signal(false);
  success = signal(false);
  error = signal('');

  async submit() {
    this.touched.set(true);
    if (!this.currentPassword()) {
      return;
    }

    if (!this.isPasswordValid()) {
      return;
    }

    if (this.passwordsMismatch()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set(false);

    try {
      // Si el backend requiere MFA, devolverá 403 y el interceptor abrirá el modal, agregando el totp_code
      await firstValueFrom(
        this.securityService.changePassword({
          current_password: this.currentPassword(),
          new_password: this.newPassword(),
          new_password_confirmation: this.confirmPassword()
        })
      );
      this.success.set(true);
      this.currentPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');
      
      // El backend invalida las sesiones al confirmar el cambio. No intentamos
      // llamar a logout con un bearer que puede quedar revocado: cerramos el
      // estado local y llevamos al usuario a iniciar sesión inmediatamente.
      this.tokenStore.clear();
      this.sessionStore.clearSession();
      await this.router.navigate(['/auth/login'], { replaceUrl: true });
    } catch (error: unknown) {
      this.error.set(apiErrorMessage(error, 'No fue posible cambiar la contraseña. Revise su contraseña actual.'));
    } finally {
      this.loading.set(false);
    }
  }
}
