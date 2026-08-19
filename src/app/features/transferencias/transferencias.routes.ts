import { Routes } from '@angular/router';
import { anyPermissionGuard } from '../../core/guards/permission.guard';

export const transferenciasRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./transferencias-page.component').then(
        (module) => module.TransferenciasPageComponent,
      ),
    canActivate: [
      anyPermissionGuard([
        'organization_changes.view',
        'organization_changes.manage_branch',
        'organization_changes.manage_global',
      ]),
    ],
  },
];
