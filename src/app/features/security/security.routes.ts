import { CanDeactivateFn, Routes } from '@angular/router';

interface CanLeaveComponent {
  canLeave(): boolean;
}

const unsavedSecuritySecretsGuard: CanDeactivateFn<CanLeaveComponent> = (component) => component.canLeave();

export const SECURITY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/security-dashboard/security-dashboard').then(c => c.SecurityDashboard),
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(c => c.ProfileComponent)
      },
      {
        path: 'password',
        loadComponent: () => import('./pages/password-change/password-change').then(c => c.PasswordChange)
      },
      {
        path: 'mfa',
        loadComponent: () => import('./pages/mfa/mfa.component').then(c => c.MfaComponent)
      },
      {
        path: 'recovery-codes',
        loadComponent: () => import('./pages/recovery-codes/recovery-codes.component').then(c => c.RecoveryCodesComponent),
        canDeactivate: [unsavedSecuritySecretsGuard]
      },
      {
        path: 'sessions',
        loadComponent: () => import('./pages/sessions/sessions.component').then(c => c.SessionsComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./pages/history/history.component').then(c => c.HistoryComponent)
      },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      }
    ]
  }
];
