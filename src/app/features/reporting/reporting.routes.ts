import { Routes } from '@angular/router';

import { anyPermissionGuard } from '@core/guards/any-permission.guard';
import { opaqueIdentifierGuard } from '@core/guards/opaque-identifier.guard';

const REPORT_PERMISSIONS = [
  'reports.view.own',
  'reports.view.assigned',
  'reports.view.branch',
  'reports.view.global',
];
const REPORT_BLOCKER =
  'ReportDefinitionResource, ReportRunResource, columnas, filas, filtros, estados y formatos de exportación continúan sin estructura contractual completa.';

export const REPORTING_ROUTES: Routes = [
  reportRoute('', 'FE25.01', 'Catálogo de reportes', REPORT_BLOCKER),
  reportRoute('ejecuciones', 'FE25.05', 'Ejecuciones de reportes', REPORT_BLOCKER),
  reportRoute(
    'ejecuciones/:runId/resultados',
    'FE25.06',
    'Resultados de ejecución',
    REPORT_BLOCKER,
    'runId',
  ),
  reportRoute('ejecuciones/:runId', 'FE25.05', 'Detalle de ejecución', REPORT_BLOCKER, 'runId'),
  reportRoute(
    ':reportCode',
    'FE25.02–FE25.04',
    'Configuración y ejecución de reporte',
    REPORT_BLOCKER,
    'reportCode',
  ),
];

function reportRoute(
  path: string,
  code: string,
  title: string,
  blocker: string,
  identifierParameter?: string,
): Routes[number] {
  return {
    path,
    pathMatch: 'full',
    canActivate: identifierParameter
      ? [anyPermissionGuard, opaqueIdentifierGuard]
      : [anyPermissionGuard],
    data: {
      permissions: REPORT_PERMISSIONS,
      identifierParameter,
      code,
      title,
      message:
        'La pantalla permanece en un estado controlado hasta recibir definiciones y resultados implementables.',
      blocker,
    },
    loadComponent: () =>
      import('./pages/contract-status/reporting-contract-status-page.component').then(
        (module) => module.ReportingContractStatusPageComponent,
      ),
  };
}
