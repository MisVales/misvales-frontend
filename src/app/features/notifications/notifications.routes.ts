import { Routes } from '@angular/router';

import { anyPermissionGuard } from '@core/guards/any-permission.guard';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [anyPermissionGuard],
    data: {
      permissions: ['auth.context.read'],
      message:
        'La bandeja permanece en un estado controlado hasta recibir un NotificationResource implementable.',
      blocker:
        'No se infieren título, resumen, fecha, contador ni destino. La navegación profunda permanece deshabilitada hasta que el Resource publique un tipo y un identificador permitidos.',
    },
    loadComponent: () =>
      import('./pages/contract-status/notifications-contract-status-page.component').then(
        (module) => module.NotificationsContractStatusPageComponent,
      ),
  },
];
