import {
  ExecutiveMetric,
  FinancialMetric,
  GlobalAlert,
  NavigationGroup,
} from '@features/dashboard/presentation/models/executive.models';

export const EXECUTIVE_METRICS: readonly ExecutiveMetric[] = [
  {
    id: 'branches',
    icon: 'landmark',
    label: 'Sucursales activas',
    value: 24,
    description: 'de 24',
    badge: '100% operativas',
  },
  { id: 'distributors', icon: 'store', label: 'Distribuidoras activas', value: 186 },
  { id: 'requests', icon: 'file-text', label: 'Solicitudes pendientes', value: 27 },
  {
    id: 'alerts',
    icon: 'alert-triangle',
    label: 'Alertas de riesgo',
    value: 7,
    badge: 'Requieren atención',
    tone: 'red',
  },
];

export const NAVIGATION_GROUPS: readonly NavigationGroup[] = [
  {
    id: 'operation',
    label: 'Operación',
    icon: 'briefcase',
    items: [
      { id: 'distributors', label: 'Distribuidoras' },
      { id: 'payments', label: 'Relaciones y pagos' },
      { id: 'incidents', label: 'Incidencias' },
    ],
  },
  {
    id: 'authorizations',
    label: 'Autorizaciones',
    icon: 'shield-check',
    items: [
      { id: 'signups', label: 'Altas' },
      { id: 'increases', label: 'Incrementos' },
      { id: 'reconciliation', label: 'Conciliación manual' },
    ],
  },
  {
    id: 'organization',
    label: 'Organización',
    icon: 'users',
    items: [
      { id: 'branches', label: 'Sucursales' },
      { id: 'staff', label: 'Personal y reasignaciones' },
    ],
  },
];

export const GLOBAL_ALERTS: readonly GlobalAlert[] = [
  {
    id: 'risk',
    icon: 'alert-triangle',
    message: '3 relaciones consecutivas en riesgo',
    count: 3,
    severity: 'critical',
    timestamp: 'Hace 15 min',
  },
  {
    id: 'cutoff',
    icon: 'settings',
    message: 'Fallas en procesos de corte',
    count: 2,
    severity: 'warning',
    timestamp: 'Hace 45 min',
  },
  {
    id: 'bank',
    icon: 'landmark',
    message: 'Archivo bancario rechazado',
    count: 1,
    severity: 'warning',
    timestamp: 'Hace 1 h',
  },
  {
    id: 'security',
    icon: 'shield-check',
    message: 'Eventos de seguridad',
    count: 2,
    severity: 'security',
    timestamp: 'Hace 3 h',
  },
];

export const FINANCIAL_METRICS: readonly FinancialMetric[] = [
  {
    id: 'generated',
    icon: 'chart-no-axes-combined',
    label: 'Relaciones generadas',
    value: '1,248',
  },
  { id: 'paid', icon: 'check-circle', label: 'Abonados', value: '982' },
  { id: 'settled', icon: 'coins', label: 'Liquidados', value: '721' },
  { id: 'overdue', icon: 'octagon-alert', label: 'Vencidos', value: '45' },
];
