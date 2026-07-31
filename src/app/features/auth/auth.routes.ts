import { Routes } from '@angular/router';

import { mfaChallengeGuard, recoveryTokenGuard } from './guards/temporary-flow.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/login-page.component').then((module) => module.LoginPageComponent),
  },
  {
    path: 'verificacion',
    canActivate: [mfaChallengeGuard],
    loadComponent: () =>
      import('./pages/mfa-verification-page.component').then(
        (module) => module.MfaVerificationPageComponent,
      ),
  },
  {
    path: 'invitacion',
    loadComponent: () =>
      import('./pages/invitation-page.component').then((module) => module.InvitationPageComponent),
  },
  {
    path: 'recuperar',
    loadComponent: () =>
      import('./pages/recovery-request-page.component').then(
        (module) => module.RecoveryRequestPageComponent,
      ),
  },
  {
    path: 'recuperar/confirmar',
    canActivate: [recoveryTokenGuard],
    loadComponent: () =>
      import('./pages/recovery-complete-page.component').then(
        (module) => module.RecoveryCompletePageComponent,
      ),
  },
];
