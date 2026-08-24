import { Routes } from '@angular/router';
import { anyPermissionGuard } from '../../core/guards/permission.guard';

export const AUDITORIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/auditoria-page/auditoria-page.component').then(
        (m) => m.AuditoriaPageComponent,
      ),
    canActivate: [anyPermissionGuard(['audit.view_global', 'audit.view_branch', 'audit.view'])],
  },
];
