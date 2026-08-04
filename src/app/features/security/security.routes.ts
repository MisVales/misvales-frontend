import { Routes } from '@angular/router';

export const SECURITY_ROUTES: Routes = [
  {
    path: 'totp',
    loadComponent: () => import('./pages/totp-setup/totp-setup.component').then(c => c.TotpSetupComponent)
  },
  {
    path: 'recovery-codes',
    loadComponent: () => import('./pages/recovery-codes/recovery-codes.component').then(c => c.RecoveryCodesComponent),
    canDeactivate: [(c: any) => c.canLeave ? c.canLeave() : true]
  },
  {
    path: 'sessions',
    loadComponent: () => import('./pages/sessions/sessions.component').then(c => c.SessionsComponent)
  },
  {
    path: '',
    redirectTo: 'totp',
    pathMatch: 'full'
  }
];
