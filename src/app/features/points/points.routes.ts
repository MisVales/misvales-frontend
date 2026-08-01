import { Routes } from '@angular/router';

import { anyPermissionGuard } from '@core/guards/any-permission.guard';
import { opaqueIdentifierGuard } from '@core/guards/opaque-identifier.guard';

const OWN_POINTS = ['points.view.own'];
const ADMIN_POINTS = ['points.view.branch', 'points.view.global'];
const ADMIN_REDEMPTIONS = [
  ...ADMIN_POINTS,
  'points.redemptions.decide.branch',
  'points.redemptions.decide.global',
];
const RESOURCE_MESSAGE =
  'La guía aún no define los campos, tipos, nulabilidad ni capacidades del Resource. No se mostrarán datos inferidos.';
const REDEMPTION_BLOCKER =
  'La creación y finalización de canjes no están publicadas. Las decisiones también permanecen deshabilitadas hasta cerrar el Resource y el token de reautenticación.';

export const POINTS_MOBILE_ROUTES: Routes = [
  contractRoute('', OWN_POINTS, 'FE21.01', 'Mis puntos', RESOURCE_MESSAGE, '/movil'),
  contractRoute(
    'movimientos',
    OWN_POINTS,
    'FE21.01',
    'Movimientos de puntos',
    RESOURCE_MESSAGE,
    '/movil/puntos',
  ),
];

export const POINT_REDEMPTIONS_MOBILE_ROUTES: Routes = [
  contractRoute('', OWN_POINTS, 'FE21.06', 'Mis canjes', REDEMPTION_BLOCKER, '/movil'),
  contractRoute(
    ':redemptionId',
    OWN_POINTS,
    'FE21.06',
    'Detalle de canje',
    REDEMPTION_BLOCKER,
    '/movil/canjes',
    'redemptionId',
  ),
];

export const POINTS_ADMIN_ROUTES: Routes = [
  contractRoute(
    'distribuidoras/:distributorId',
    ADMIN_POINTS,
    'FE21.02',
    'Puntos de distribuidora',
    RESOURCE_MESSAGE,
    '/administrativa',
    'distributorId',
  ),
  contractRoute(
    'relaciones/:relationId',
    ADMIN_POINTS,
    'FE21.03',
    'Puntos de relación',
    RESOURCE_MESSAGE,
    '/administrativa',
    'relationId',
  ),
  contractRoute(
    'ejecuciones',
    ['points.runs.view.global'],
    'FE21.08',
    'Ejecuciones de puntos',
    RESOURCE_MESSAGE,
    '/administrativa',
  ),
  contractRoute(
    'ejecuciones/:runId',
    ['points.runs.view.global'],
    'FE21.08',
    'Detalle de ejecución de puntos',
    RESOURCE_MESSAGE,
    '/administrativa/puntos/ejecuciones',
    'runId',
  ),
];

export const POINT_REDEMPTIONS_ADMIN_ROUTES: Routes = [
  contractRoute(
    '',
    ADMIN_REDEMPTIONS,
    'FE21.06',
    'Bandeja de canjes',
    REDEMPTION_BLOCKER,
    '/administrativa',
  ),
  contractRoute(
    ':redemptionId',
    ADMIN_REDEMPTIONS,
    'FE21.07',
    'Detalle y decisión de canje',
    REDEMPTION_BLOCKER,
    '/administrativa/canjes',
    'redemptionId',
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
      import('./pages/contract-status/points-contract-status-page.component').then(
        (module) => module.PointsContractStatusPageComponent,
      ),
  };
}
