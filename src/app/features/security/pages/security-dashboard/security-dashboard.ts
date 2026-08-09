import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './security-dashboard.html',
})
export class SecurityDashboard {
  tabs = [
    { title: 'Perfil', icon: 'user', route: 'profile' },
    { title: 'Contraseña', icon: 'key', route: 'password' },
    { title: 'MFA (Factores de autenticidad)', icon: 'shield-check', route: 'mfa' },
    { title: 'Códigos de rescate', icon: 'shield-alert', route: 'recovery-codes' },
    { title: 'Sesiones activas', icon: 'monitor-smartphone', route: 'sessions' },
    { title: 'Historial', icon: 'history', route: 'history' },
  ];
}
