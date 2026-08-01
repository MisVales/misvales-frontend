import { Routes } from '@angular/router';

import { anyPermissionGuard } from '@core/guards/any-permission.guard';
import { opaqueIdentifierGuard } from '@core/guards/opaque-identifier.guard';

const AUDIT_PERMISSIONS = ['security.audit.global.read'];
const AUDIT_BLOCKER =
  'AuditEventSummaryResource, AuditEventResource, catálogos y política central de redacción continúan pendientes; no se renderizan metadatos, before/after ni payloads supuestos.';

export const AUDIT_ROUTES: Routes = [
  auditRoute('', 'FE27.01–FE27.03', 'Explorador de auditoría'),
  auditRoute(':auditEventId', 'FE27.02', 'Detalle de evento auditado', 'auditEventId'),
];

function auditRoute(
  path: string,
  code: string,
  title: string,
  identifierParameter?: string,
): Routes[number] {
  return {
    path,
    pathMatch: 'full',
    canActivate: identifierParameter
      ? [anyPermissionGuard, opaqueIdentifierGuard]
      : [anyPermissionGuard],
    data: {
      permissions: AUDIT_PERMISSIONS,
      identifierParameter,
      code,
      title,
      message:
        'La pantalla permanece en un estado controlado hasta recibir Resources y catálogos implementables.',
      blocker: AUDIT_BLOCKER,
    },
    loadComponent: () =>
      import('./pages/contract-status/audit-contract-status-page.component').then(
        (module) => module.AuditContractStatusPageComponent,
      ),
  };
}
