import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { ActivateAccount } from './pages/activate-account/activate-account';
import { RecoverAccess } from './pages/recover-access/recover-access';
import { ResetPassword } from './pages/reset-password/reset-password';
import { Totp } from './pages/totp/totp';

export const authRoutes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'totp',
    component: Totp
  },
  {
    path: 'activar-cuenta',
    component: ActivateAccount
  },
  {
    path: 'recuperar-acceso',
    component: RecoverAccess
  },
  {
    path: 'restablecer-contrasena',
    component: ResetPassword
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
