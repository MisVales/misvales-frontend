/**
 * Árbol único de navegación de MisVales.
 *
 * `roles` define la audiencia funcional entregada por el negocio. Cuando una
 * opción también declara `permissions`, ambos controles deben cumplirse. La
 * autorización definitiva permanece en el servidor.
 */

import type { RoleCode } from '@core/config/experience/experience.models';

export type { RoleCode } from '@core/config/experience/experience.models';

export interface NavItemData {
  id: string;
  title: string;
  description?: string;
  icon: string;
  route?: string;
  fragment?: string;
  roles?: readonly RoleCode[];
  permissions?: readonly string[];
  permissionMode?: 'all' | 'any';
  badge?: number | string;
  action?: 'logout';
  children?: NavItemData[];
}

export interface NavGroupData {
  heading: string;
  icon: string;
  items: NavItemData[];
}

const ALL: readonly RoleCode[] = [
  'general_manager',
  'admin',
  'branch_manager',
  'coordinator',
  'verifier',
  'distributor',
  'cashier',
];
const GG_AD_GS: readonly RoleCode[] = ['general_manager', 'admin', 'branch_manager'];
const GG_AD_GS_CO: readonly RoleCode[] = [...GG_AD_GS, 'coordinator'];
const VE: readonly RoleCode[] = ['verifier'];
const GG_AD_GS_CO_DI: readonly RoleCode[] = [...GG_AD_GS_CO, 'distributor'];
const GG_AD_GS_DI: readonly RoleCode[] = [...GG_AD_GS, 'distributor'];
const GG_AD_GS_CO_DI_CA: readonly RoleCode[] = [...GG_AD_GS_CO_DI, 'cashier'];

export const NAV_GROUPS: NavGroupData[] = [
  {
    heading: 'Inicio',
    icon: 'layout-dashboard',
    items: [
      {
        id: 'dashboard',
        title: 'Inicio',
        icon: 'layout-dashboard',
        route: '/inicio',
        roles: ALL,
      },
    ],
  },
  {
    heading: 'Organización',
    icon: 'building-2',
    items: [
      {
        id: 'branches',
        title: 'Sucursales',
        icon: 'map-pin',
        route: '/organizacion/sucursales',
        roles: GG_AD_GS,
        permissions: ['branches.view'],
      },
      {
        id: 'distributors',
        title: 'Distribuidoras',
        icon: 'store',
        route: '/solicitudes-distribuidoras',
        roles: GG_AD_GS_CO,
        permissions: ['distributor_applications.view'],
      },
      {
        id: 'verifier-visits',
        title: 'Visitas asignadas',
        icon: 'clipboard-check',
        route: '/verificacion-distribuidoras/verificaciones/asignadas',
        roles: VE,
        permissions: ['distributor_applications.view'],
      },
      {
        id: 'users',
        title: 'Usuarios y personal',
        icon: 'users',
        route: '/usuarios',
        roles: GG_AD_GS,
        permissions: ['users.view'],
      },
    ],
  },
  {
    heading: 'Configuración y catálogos',
    icon: 'settings',
    items: [
      {
        id: 'configurations',
        title: 'Configuraciones globales',
        icon: 'sliders-horizontal',
        route: '/configuraciones',
        roles: ['general_manager', 'admin'],
        permissions: ['catalogs.view_published', 'catalogs.view_history'],
        permissionMode: 'any',
      },
      {
        id: 'categories',
        title: 'Categorías',
        icon: 'layers',
        route: '/categorias',
        roles: ['general_manager', 'admin'],
        permissions: ['catalogs.view_published', 'catalogs.view_history'],
        permissionMode: 'any',
      },
      {
        id: 'products',
        title: 'Productos',
        icon: 'package',
        route: '/productos',
        roles: ['general_manager', 'admin'],
        permissions: ['catalogs.view_published', 'catalogs.view_history'],
        permissionMode: 'any',
      },
    ],
  },
  {
    heading: 'Crédito de distribuidoras',
    icon: 'credit-card',
    items: [
      {
        id: 'credit-lines',
        title: 'Líneas de crédito',
        icon: 'credit-card',
        route: '/distribuidoras/lineas-credito',
        roles: GG_AD_GS_DI,
        permissions: [
          'credit_lines.view_own',
          'credit_lines.view_assigned',
          'credit_lines.view_branch',
          'credit_lines.view_global',
        ],
        permissionMode: 'any',
      },
      {
        id: 'credit-increases',
        title: 'Incrementos de línea',
        icon: 'circle-arrow-up',
        route: '/distribuidoras/incrementos-linea',
        roles: GG_AD_GS_CO_DI,
        permissions: [
          'credit_increase_requests.view_own',
          'credit_increase_requests.view_assigned',
          'credit_increase_requests.view_branch',
          'credit_increase_requests.view_global',
        ],
        permissionMode: 'any',
      },
    ],
  },
  {
    heading: 'Vales',
    icon: 'ticket',
    items: [
      {
        id: 'vouchers',
        title: 'Prevales y vales',
        icon: 'ticket-check',
        route: '/vales',
        roles: GG_AD_GS_CO_DI_CA,
        permissions: [
          'vouchers.create_own',
          'vouchers.view_own',
          'vouchers.view_assigned',
          'vouchers.view_branch',
          'vouchers.view_global',
        ],
        permissionMode: 'any',
      },
      {
        id: 'cashier',
        title: 'Caja y autorizaciones',
        icon: 'banknote',
        route: '/vales/caja-feriado',
        roles: ['general_manager', 'branch_manager', 'coordinator', 'cashier'],
        permissions: [
          'vouchers.cash_branch',
          'voucher_modifications.authorize_branch',
          'voucher_modifications.authorize_global',
        ],
        permissionMode: 'any',
      },
    ],
  },
  {
    heading: 'Relaciones y pagos',
    icon: 'receipt-text',
    items: [
      {
        id: 'relations',
        title: 'Relaciones',
        icon: 'file-stack',
        route: '/relaciones-pagos/relaciones',
        roles: GG_AD_GS_CO_DI,
        permissions: [
          'relations.view_own',
          'relations.view_assigned',
          'relations.view_branch',
          'relations.view_global',
        ],
        permissionMode: 'any',
      },
      {
        id: 'bank-file',
        title: 'Archivo bancario',
        icon: 'file-down',
        route: '/relaciones-pagos/archivo-bancario',
        roles: ['general_manager', 'admin', 'branch_manager', 'cashier'],
        permissions: [
          'bank_imports.create_branch',
          'bank_imports.view_branch',
          'bank_imports.view_global',
        ],
        permissionMode: 'any',
      },
      {
        id: 'reconciliation',
        title: 'Conciliación',
        icon: 'git-merge',
        route: '/relaciones-pagos/conciliacion',
        roles: ['general_manager', 'admin', 'branch_manager', 'coordinator', 'cashier'],
        permissions: ['bank_movements.view_branch', 'bank_movements.view_global'],
        permissionMode: 'any',
      },
      {
        id: 'payments',
        title: 'Pagos y recuperación de línea',
        icon: 'banknote',
        route: '/relaciones-pagos/pagos',
        roles: GG_AD_GS_CO_DI_CA,
        permissions: [
          'relations.view_own',
          'relations.view_assigned',
          'relations.view_branch',
          'relations.view_global',
        ],
        permissionMode: 'any',
      },
      {
        id: 'surpluses',
        title: 'Excedentes y devoluciones',
        icon: 'undo-2',
        route: '/relaciones-pagos/excedentes',
        roles: ['general_manager', 'admin', 'branch_manager', 'distributor'],
        permissions: ['surpluses.view_own', 'surpluses.view_branch', 'surpluses.view_global'],
        permissionMode: 'any',
      },
      {
        id: 'points-redemption',
        title: 'Puntos y canje por dinero',
        icon: 'coins',
        route: '/puntos',
        roles: GG_AD_GS_CO_DI_CA,
        permissions: [
          'points.view_own',
          'points.view_branch',
          'points.view_global',
          'points.request_own',
          'points.authorize_branch',
          'points.authorize_global',
          'points.deliver_branch',
        ],
        permissionMode: 'any',
      },
    ],
  },
  {
    heading: 'Riesgo',
    icon: 'triangle-alert',
    items: [
      {
        id: 'risk-delinquency',
        title: 'Morosidad',
        icon: 'shield-alert',
        route: '/riesgo',
        roles: GG_AD_GS_CO_DI,
        permissions: [
          'risk.view_own',
          'risk.view_assigned',
          'risk.view_branch',
          'risk.view_global',
        ],
        permissionMode: 'any',
      },
    ],
  },
  {
    heading: 'Auditoría y control',
    icon: 'shield',
    items: [
      {
        id: 'system-audit',
        title: 'Auditoría del sistema',
        icon: 'file-text',
        route: '/auditoria',
        roles: ALL,
        permissions: ['audit.view_branch', 'audit.view_global', 'audit.view'],
        permissionMode: 'any',
      },
      {
        id: 'operations-center',
        title: 'Centro de operación',
        icon: 'bell-ring',
        route: '/centro-operacion',
        roles: ALL,
        permissions: [
          'notifications.view_own',
          'reports.view_branch',
          'reports.view_global',
          'audit.view_branch',
          'audit.view_global',
          'logs.view_branch',
          'logs.view_global',
        ],
        permissionMode: 'any',
      },
    ],
  },
];

const generalManagerItem = (id: string): NavItemData => {
  const item = NAV_GROUPS.flatMap((group) => group.items).find((candidate) => candidate.id === id);
  if (!item) throw new Error(`No existe la opción de navegación ${id}.`);

  return { ...item };
};

const managerialNavigationGroups = (
  role: 'general_manager' | 'branch_manager' | 'admin',
): NavGroupData[] => {
  const branchesItem = generalManagerItem('branches');
  if (role === 'branch_manager') branchesItem.title = 'Mi sucursal';

  const authorizationItem: NavItemData =
    role === 'admin'
      ? {
          id: 'admin-applications-review',
          title: 'Solicitudes',
          icon: 'clipboard-check',
          route: '/verificacion-distribuidoras/solicitudes-distribuidora/revision',
          roles: ['admin'],
          permissions: ['distributor_applications.view'],
        }
      : {
          id: 'manager-authorizations',
          title: 'Solicitudes por autorizar',
          icon: 'clipboard-check',
          route: '/verificacion-distribuidoras/solicitudes-distribuidora/autorizaciones',
          roles: [role],
          permissions: ['distributor_applications.view'],
        };

  const cashierItem: NavItemData =
    role === 'admin'
      ? {
          ...generalManagerItem('cashier'),
          title: 'Caja y autorizaciones',
          route: '/vales',
          roles: ['admin'],
          permissions: ['vouchers.view_global'],
        }
      : generalManagerItem('cashier');

  return [
    {
      heading: 'Inicio',
      icon: 'layout-dashboard',
      items: [generalManagerItem('dashboard')],
    },
    {
      heading: role === 'branch_manager' ? 'Gerencia de sucursal' : 'Gerencia general',
      icon: 'briefcase',
      items: [
        {
          id: 'general-manager-branches',
          title: role === 'branch_manager' ? 'Mi sucursal' : 'Sucursales',
          description: '¿Dónde y con quién quiero trabajar?',
          icon: 'building-2',
          roles: [role],
          children: [branchesItem, generalManagerItem('distributors'), generalManagerItem('users')],
        },
        {
          id: 'general-manager-pending',
          title: 'Pendientes',
          description: '¿Qué necesita mi decisión?',
          icon: 'inbox',
          roles: [role],
          children: [
            authorizationItem,
            generalManagerItem('credit-increases'),
            cashierItem,
            generalManagerItem('reconciliation'),
            generalManagerItem('surpluses'),
            generalManagerItem('points-redemption'),
            generalManagerItem('risk-delinquency'),
          ],
        },
        ...(role !== 'branch_manager'
          ? [
              {
                id: 'general-manager-administration',
                title: 'Administración',
                description: '¿Con qué productos, categorías y reglas funciona?',
                icon: 'settings',
                roles: [role],
                children: [
                  generalManagerItem('products'),
                  generalManagerItem('categories'),
                  generalManagerItem('configurations'),
                  generalManagerItem('operations-center'),
                  ...(role === 'admin' ? [{
                    id: 'admin-error-catalog',
                    title: 'Errores',
                    description: 'Diccionario de códigos y definiciones por audiencia',
                    icon: 'book-open',
                    route: '/errores',
                    roles: ['admin' as const],
                  }] : []),
                ],
              },
            ]
          : []),
        {
          id: 'general-manager-audit',
          title: 'Auditoría general',
          description: '¿Qué ocurrió, quién lo hizo y cuándo?',
          icon: 'history',
          route: '/auditoria',
          roles: [role],
          permissions: ['audit.view_branch', 'audit.view_global', 'audit.view'],
          permissionMode: 'any',
        },
      ],
    },
  ];
};

export const GENERAL_MANAGER_NAV_GROUPS: NavGroupData[] =
  managerialNavigationGroups('general_manager');

export const BRANCH_MANAGER_NAV_GROUPS: NavGroupData[] =
  managerialNavigationGroups('branch_manager');

export const ADMIN_NAV_GROUPS: NavGroupData[] = managerialNavigationGroups('admin');

export const CASHIER_NAV_GROUPS: NavGroupData[] = [
  {
    heading: 'Inicio',
    icon: 'layout-dashboard',
    items: [generalManagerItem('dashboard')],
  },
  {
    heading: 'Operación',
    icon: 'banknote',
    items: [
      {
        id: 'cashier-operation',
        title: 'Caja',
        description: 'Vales, pagos y conciliaciones',
        icon: 'banknote',
        roles: ['cashier'],
        children: [
          { ...generalManagerItem('cashier'), title: 'Vales' },
          { ...generalManagerItem('payments'), title: 'Pagos' },
          { ...generalManagerItem('reconciliation'), title: 'Conciliaciones' },
          {
            ...generalManagerItem('reconciliation'),
            id: 'clarifications',
            title: 'Aclaraciones',
            icon: 'message-circle-question',
            route: '/relaciones-pagos/aclaraciones',
            fragment: undefined,
          },
        ],
      },
    ],
  },
];

export const VERIFIER_NAV_GROUPS: NavGroupData[] = [
  {
    heading: 'Verificación',
    icon: 'clipboard-check',
    items: [
      { ...generalManagerItem('dashboard'), roles: VE },
      {
        id: 'verifier-visits',
        title: 'Visitas',
        icon: 'clipboard-check',
        route: '/verificacion-distribuidoras/verificaciones/asignadas',
        roles: VE,
        permissions: ['distributor_applications.view'],
      },
      {
        id: 'verifier-calendar',
        title: 'Calendario',
        icon: 'calendar-days',
        route: '/verificacion-distribuidoras/verificaciones/calendario',
        roles: VE,
        permissions: ['distributor_applications.view'],
      },
    ],
  },
];

export function navigationGroupsForRoles(roles: readonly string[]): readonly NavGroupData[] {
  if (roles.includes('general_manager')) return GENERAL_MANAGER_NAV_GROUPS;
  if (roles.includes('admin')) return ADMIN_NAV_GROUPS;
  if (roles.includes('branch_manager')) return BRANCH_MANAGER_NAV_GROUPS;
  if (roles.includes('cashier')) return CASHIER_NAV_GROUPS;
  if (roles.includes('verifier')) return VERIFIER_NAV_GROUPS;

  return NAV_GROUPS;
}

export const BOTTOM_ITEMS: NavItemData[] = [
  {
    id: 'my-account',
    title: 'Mi cuenta',
    icon: 'circle-user-round',
    roles: ALL,
    children: [
      {
        id: 'profile-security',
        title: 'Perfil y seguridad',
        icon: 'shield-check',
        route: '/seguridad',
        roles: ALL,
      },
      {
        id: 'active-sessions',
        title: 'Sesiones activas',
        icon: 'monitor',
        route: '/seguridad/sessions',
        roles: ALL,
      },
    ],
  },
  { id: 'logout', title: 'Cerrar sesión', icon: 'log-out', action: 'logout', roles: ALL },
];
