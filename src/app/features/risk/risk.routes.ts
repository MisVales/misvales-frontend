import { Routes } from '@angular/router';

import { anyPermissionGuard } from '@core/guards/any-permission.guard';
import { opaqueIdentifierGuard } from '@core/guards/opaque-identifier.guard';

const ADMIN_RISK = ['risk.view.branch', 'risk.view.global'];
const TABLET_RISK = ['risk.view.assigned'];
const ADMIN_REMOVALS = [
  ...ADMIN_RISK,
  'delinquency.removal.decide.branch',
  'delinquency.removal.decide.global',
];
const RISK_BLOCKER =
  'Los Resources de perfil, evaluaciones, alertas y revisión no definen campos. La secuencia conserva además una respuesta de fuente pendiente.';
const REMOVAL_BLOCKER =
  'La UI no deduce regularización ni capacidades. Preparación y decisiones permanecen deshabilitadas hasta cerrar los Resources y, para las decisiones, la reautenticación.';

export const RISK_ADMIN_ROUTES: Routes = [
  contractRoute(
    '',
    ADMIN_RISK,
    'FE22.01',
    'Riesgo de distribuidoras',
    RISK_BLOCKER,
    '/administrativa',
  ),
  contractRoute(
    ':distributorId',
    ADMIN_RISK,
    'FE22.02',
    'Perfil de riesgo',
    RISK_BLOCKER,
    '/administrativa/riesgo',
    'distributorId',
  ),
  contractRoute(
    'alertas/:alertId',
    ADMIN_RISK,
    'FE22.03–FE22.04',
    'Detalle de alerta de riesgo',
    RISK_BLOCKER,
    '/administrativa/riesgo',
    'alertId',
  ),
];

export const RISK_TABLET_ROUTES: Routes = [
  contractRoute('', TABLET_RISK, 'FE22.01', 'Riesgo de distribuidoras', RISK_BLOCKER, '/operativa'),
  contractRoute(
    ':distributorId',
    TABLET_RISK,
    'FE22.02',
    'Perfil de riesgo',
    RISK_BLOCKER,
    '/operativa/riesgo',
    'distributorId',
  ),
  contractRoute(
    'alertas/:alertId',
    TABLET_RISK,
    'FE22.03',
    'Detalle de alerta de riesgo',
    RISK_BLOCKER,
    '/operativa/riesgo',
    'alertId',
  ),
];

export const REMOVALS_ADMIN_ROUTES: Routes = [
  contractRoute(
    'retiros',
    ADMIN_REMOVALS,
    'FE22.05–FE22.06',
    'Solicitudes de retiro de morosidad',
    REMOVAL_BLOCKER,
    '/administrativa',
  ),
  contractRoute(
    'retiros/:removalRequestId',
    ADMIN_REMOVALS,
    'FE22.06',
    'Detalle de retiro de morosidad',
    REMOVAL_BLOCKER,
    '/administrativa/morosidad/retiros',
    'removalRequestId',
  ),
];

export const REMOVALS_TABLET_ROUTES: Routes = [
  contractRoute(
    'retiros',
    [...TABLET_RISK, 'delinquency.removal.prepare'],
    'FE22.05',
    'Preparación de retiro de morosidad',
    REMOVAL_BLOCKER,
    '/operativa',
  ),
  contractRoute(
    'retiros/:removalRequestId',
    [...TABLET_RISK, 'delinquency.removal.prepare'],
    'FE22.05',
    'Detalle de retiro de morosidad',
    REMOVAL_BLOCKER,
    '/operativa/morosidad/retiros',
    'removalRequestId',
  ),
];

function contractRoute(
  path: string,
  permissions: readonly string[],
  code: string,
  title: string,
  blocker: string,
  returnPath: string,
  identifierParameter?: string,
): Routes[number] {
  return {
    path,
    pathMatch: 'full',
    canActivate: identifierParameter
      ? [anyPermissionGuard, opaqueIdentifierGuard]
      : [anyPermissionGuard],
    data: {
      permissions,
      identifierParameter,
      code,
      title,
      message:
        'La pantalla permanece en un estado controlado hasta recibir un contrato de respuesta implementable.',
      blocker,
      returnPath,
    },
    loadComponent: () =>
      import('./pages/contract-status/risk-contract-status-page.component').then(
        (module) => module.RiskContractStatusPageComponent,
      ),
  };
}
