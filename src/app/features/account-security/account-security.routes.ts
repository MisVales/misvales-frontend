import { Routes } from '@angular/router';

import { permissionGuard } from '@core/guards/permission.guard';

export const ACCOUNT_SECURITY_ROUTES: Routes = [
  {
    path: 'seguridad',
    loadComponent: () =>
      import('./pages/security-hub-page.component').then(
        (module) => module.SecurityHubPageComponent,
      ),
  },
  {
    path: 'seguridad/totp',
    canActivate: [permissionGuard],
    data: { permission: 'auth.mfa.manage_own' },
    loadComponent: () =>
      import('./pages/totp-page.component').then((module) => module.TotpPageComponent),
  },
  {
    path: 'seguridad/passkeys',
    canActivate: [permissionGuard],
    data: { permission: 'auth.mfa.manage_own' },
    loadComponent: () =>
      import('./pages/passkeys-page.component').then((module) => module.PasskeysPageComponent),
  },
  {
    path: 'seguridad/codigos-recuperacion',
    canActivate: [permissionGuard],
    data: { permission: 'auth.mfa.manage_own' },
    loadComponent: () =>
      import('./pages/recovery-codes-page.component').then(
        (module) => module.RecoveryCodesPageComponent,
      ),
  },
  {
    path: 'contrasena',
    canActivate: [permissionGuard],
    data: { permission: 'auth.password.change_own' },
    loadComponent: () =>
      import('./pages/password-page.component').then((module) => module.PasswordPageComponent),
  },
  {
    path: 'sesiones',
    canActivate: [permissionGuard],
    data: { permission: 'auth.sessions.read_own' },
    loadComponent: () =>
      import('./pages/sessions-page.component').then((module) => module.SessionsPageComponent),
  },
  {
    path: 'alertas-seguridad',
    loadComponent: () =>
      import('./pages/alerts-page.component').then((module) => module.AlertsPageComponent),
  },
];

export const ACCOUNT_ADMIN_ROUTES: Routes = [
  {
    path: 'solicitudes/nueva',
    canActivate: [permissionGuard],
    data: { permission: 'accounts.branch.request', direct: false },
    loadComponent: () =>
      import('./pages/account-form-page.component').then(
        (module) => module.AccountFormPageComponent,
      ),
  },
  {
    path: 'solicitudes',
    loadComponent: () =>
      import('./pages/account-requests-page.component').then(
        (module) => module.AccountRequestsPageComponent,
      ),
  },
  {
    path: 'nueva',
    canActivate: [permissionGuard],
    data: { permission: 'accounts.global.create', direct: true },
    loadComponent: () =>
      import('./pages/account-form-page.component').then(
        (module) => module.AccountFormPageComponent,
      ),
  },
];
