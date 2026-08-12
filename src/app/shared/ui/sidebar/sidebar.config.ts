/**
 * Árbol único de navegación de MisVales.
 *
 * `roles` define la audiencia funcional entregada por el negocio. Cuando una
 * opción también declara `permissions`, ambos controles deben cumplirse. La
 * autorización definitiva permanece en Laravel.
 */

export type RoleCode =
  | 'general_manager'
  | 'admin'
  | 'branch_manager'
  | 'coordinator'
  | 'verifier'
  | 'distributor'
  | 'cashier';

export interface NavItemData {
  id: string;
  title: string;
  icon: string;
  route?: string;
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
const GG_AD_GS_CO_VE: readonly RoleCode[] = [...GG_AD_GS_CO, 'verifier'];
const GG_AD_GS_CO_DI: readonly RoleCode[] = [...GG_AD_GS_CO, 'distributor'];
const GG_AD_GS_CO_DI_CA: readonly RoleCode[] = [...GG_AD_GS_CO_DI, 'cashier'];

export const NAV_GROUPS: NavGroupData[] = [
  {
    heading: 'Inicio',
    icon: 'layout-dashboard',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
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
        id: 'users',
        title: 'Usuarios y personal',
        icon: 'users',
        route: '/usuarios',
        roles: GG_AD_GS,
        permissions: ['users.view'],
      },
      {
        id: 'assignments',
        title: 'Asignaciones',
        icon: 'link',
        route: '/organizacion/asignaciones',
        roles: GG_AD_GS,
        permissions: ['roles.assign', 'branches.view'],
        permissionMode: 'any',
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
        roles: GG_AD_GS,
      },
      {
        id: 'categories',
        title: 'Categorías',
        icon: 'layers',
        route: '/categorias',
        roles: GG_AD_GS,
      },
      { id: 'products', title: 'Productos', icon: 'package', route: '/productos', roles: GG_AD_GS },
      {
        id: 'exchange-periods',
        title: 'Periodos de canje',
        icon: 'calendar-clock',
        route: '/periodos-canje',
        roles: GG_AD_GS,
      },
    ],
  },
  {
    heading: 'Incorporación de distribuidoras',
    icon: 'file-text',
    items: [
      {
        id: 'applications',
        title: 'Solicitudes',
        icon: 'file-text',
        route: '/solicitudes-distribuidoras',
        roles: GG_AD_GS_CO_VE,
      },
      {
        id: 'verifications',
        title: 'Verificaciones',
        icon: 'clipboard-check',
        route: '/verificacion-distribuidoras',
        roles: GG_AD_GS_CO_VE,
      },
    ],
  },
  {
    heading: 'Distribuidoras',
    icon: 'store',
    items: [
      {
        id: 'distributors',
        title: 'Distribuidoras',
        icon: 'store',
        route: '/distribuidoras',
        roles: GG_AD_GS_CO,
      },
      {
        id: 'credit-lines',
        title: 'Líneas de crédito',
        icon: 'credit-card',
        route: '/distribuidoras/lineas-credito',
        roles: GG_AD_GS_CO_DI,
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
    heading: 'Clientes',
    icon: 'users-round',
    items: [
      {
        id: 'clients',
        title: 'Clientes finales',
        icon: 'user-round',
        route: '/clientes',
        roles: GG_AD_GS_CO_DI,
      },
      {
        id: 'portfolio',
        title: 'Cartera informativa',
        icon: 'wallet',
        route: '/clientes/cartera',
        roles: GG_AD_GS_CO_DI,
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
        title: 'Caja y feriado',
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
        roles: GG_AD_GS_CO_DI_CA,
        permissions: ['relations.view_own', 'relations.view_branch', 'relations.view_global'],
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
      },
      {
        id: 'payments',
        title: 'Pagos y recuperación de línea',
        icon: 'banknote',
        route: '/relaciones-pagos/pagos',
        roles: GG_AD_GS_CO_DI_CA,
      },
      {
        id: 'surpluses',
        title: 'Excedentes y devoluciones',
        icon: 'undo-2',
        route: '/relaciones-pagos/excedentes',
        roles: ['general_manager', 'admin', 'branch_manager', 'distributor', 'cashier'],
      },
    ],
  },
  {
    heading: 'Puntos',
    icon: 'star',
    items: [
      {
        id: 'points',
        title: 'Puntos',
        icon: 'star',
        route: '/puntos',
        roles: ['general_manager', 'admin', 'branch_manager', 'distributor'],
      },
      {
        id: 'redemptions',
        title: 'Canjes',
        icon: 'package-check',
        route: '/puntos/canjes',
        roles: ['general_manager', 'admin', 'branch_manager', 'distributor'],
      },
    ],
  },
  {
    heading: 'Movilidad',
    icon: 'arrow-right-left',
    items: [
      {
        id: 'client-transfers',
        title: 'Transferencias de clientes',
        icon: 'move',
        route: '/movilidad/transferencias-clientes',
        roles: GG_AD_GS_CO_DI,
      },
      {
        id: 'client-reassignments',
        title: 'Reasignación de clientes',
        icon: 'user-round-x',
        route: '/movilidad/reasignacion-clientes',
        roles: GG_AD_GS,
      },
      {
        id: 'branch-changes',
        title: 'Cambios de sucursal',
        icon: 'building',
        route: '/movilidad/cambios-sucursal',
        roles: GG_AD_GS,
      },
      {
        id: 'coordinator-reassignments',
        title: 'Reasignación de coordinadores',
        icon: 'user-cog',
        route: '/movilidad/reasignacion-coordinadores',
        roles: GG_AD_GS,
      },
    ],
  },
  {
    heading: 'Reportes',
    icon: 'chart-no-axes-combined',
    items: [
      {
        id: 'reports',
        title: 'Reportes',
        icon: 'chart-no-axes-combined',
        route: '/reportes',
        roles: GG_AD_GS_CO,
      },
    ],
  },
  {
    heading: 'Auditoría y control',
    icon: 'shield',
    items: [
      {
        id: 'audit',
        title: 'Auditoría',
        icon: 'scroll-text',
        route: '/auditoria',
        roles: ['general_manager', 'admin'],
        permissions: ['audit.view'],
      },
      {
        id: 'logs',
        title: 'Logs',
        icon: 'file-terminal',
        route: '/logs',
        roles: ['general_manager', 'admin'],
      },
    ],
  },
  {
    heading: 'Notificaciones',
    icon: 'bell',
    items: [
      {
        id: 'notifications',
        title: 'Notificaciones',
        icon: 'bell',
        route: '/notificaciones',
        roles: ALL,
      },
    ],
  },
];

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
