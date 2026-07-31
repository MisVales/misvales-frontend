import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PermissionDirective } from '@shared/directives/permission.directive';

@Component({
  selector: 'mv-security-hub-page',
  imports: [PermissionDirective, RouterLink],
  template: `
    <section class="mv-panel">
      <p class="mv-eyebrow">Mi cuenta</p>
      <h1>Seguridad</h1>
      <nav class="mv-link-grid" aria-label="Opciones de seguridad">
        <a routerLink="totp" mvPermission="auth.mfa.manage_own">Autenticador TOTP</a>
        <a routerLink="passkeys" mvPermission="auth.mfa.manage_own">Passkeys</a>
        <a routerLink="codigos-recuperacion" mvPermission="auth.mfa.manage_own"
          >Códigos de recuperación</a
        >
        <a routerLink="../contrasena" mvPermission="auth.password.change_own">Cambiar contraseña</a>
        <a routerLink="../sesiones" mvPermission="auth.sessions.read_own">Sesiones activas</a>
        <a routerLink="../alertas-seguridad">Alertas de seguridad</a>
      </nav>
    </section>
  `,
  styles: `
    .mv-link-grid {
      display: grid;
      gap: 0.75rem;
    }
    a {
      min-height: 48px;
      border: 1px solid var(--mv-gray);
      border-radius: 0.7rem;
      padding: 0.8rem;
      font-weight: 750;
      text-decoration: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityHubPageComponent {}
