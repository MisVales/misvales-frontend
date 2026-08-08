/**
 * sidebar.config.ts
 *
 * Un solo árbol de navegación universal.
 * Cada item declara el permiso requerido; el sidebar filtra dinámicamente
 * según effective_permissions del usuario (/api/v1/me).
 *
 * NO hay perfiles duplicados por rol.
 * NO hay estados, filtros ni pestañas — solo categorías y páginas navegables.
 */

// ─── Interfaces ──────────────────────────────────────────────

export interface NavItemData {
  id: string;
  title: string;
  icon: string;
  route?: string;          // Ruta real del router Angular
  permission?: string;     // Permiso requerido (effective_permissions)
  badge?: number | string;
  shortcut?: string;
  action?: 'search' | 'logout'; // Acciones especiales sin ruta
  children?: NavItemData[];
}

export interface NavGroupData {
  heading?: string;
  items: NavItemData[];
}

// ─── Navegación principal ────────────────────────────────────

export const NAV_GROUPS: NavGroupData[] = [
  // ━━━ GENERAL ━━━
  {
    heading: 'General',
    items: [
      { id: 'search', title: 'Buscar', icon: 'search', action: 'search', shortcut: '⌘K' },
      { id: 'home', title: 'Inicio', icon: 'layout-dashboard', route: '/inicio' },
      { id: 'inbox', title: 'Bandeja', icon: 'inbox', route: '/bandeja' },
      { id: 'notifications', title: 'Notificaciones', icon: 'bell', route: '/notificaciones' },
    ],
  },

  // ━━━ OPERACIÓN ━━━
  {
    heading: 'Operación',
    items: [
      {
        id: 'distributors', title: 'Distribuidoras', icon: 'store',
        permission: 'distributors.view',
        children: [
          { id: 'dist-apps', title: 'Solicitudes', icon: 'file-text', route: '/distribuidoras/solicitudes', permission: 'applications.view' },
          { id: 'dist-verif', title: 'Verificaciones', icon: 'clipboard-check', route: '/distribuidoras/verificaciones', permission: 'verifications.view' },
          { id: 'dist-auth', title: 'Autorizaciones y activación', icon: 'shield-check', route: '/distribuidoras/autorizaciones', permission: 'applications.authorize' },
          { id: 'dist-dir', title: 'Directorio', icon: 'book-open', route: '/distribuidoras/directorio', permission: 'distributors.view' },
          { id: 'dist-cats', title: 'Categorías asignadas', icon: 'tags', route: '/distribuidoras/categorias', permission: 'categories.view' },
        ],
      },
      {
        id: 'clients', title: 'Clientes y vales', icon: 'users-round',
        permission: 'clients.view',
        children: [
          { id: 'cli-final', title: 'Clientes finales', icon: 'user-round', route: '/clientes/finales', permission: 'clients.view' },
          { id: 'cli-dup', title: 'Prevención de duplicados', icon: 'scan-search', route: '/clientes/duplicados', permission: 'clients.view' },
          { id: 'cli-portfolio', title: 'Cartera informativa', icon: 'wallet', route: '/clientes/cartera', permission: 'portfolio.view' },
          { id: 'cli-prevals', title: 'Prevales', icon: 'ticket', route: '/clientes/prevales', permission: 'vouchers.view' },
          { id: 'cli-vouchers', title: 'Vales digitales', icon: 'ticket-check', route: '/clientes/vales', permission: 'vouchers.view' },
          { id: 'cli-cash', title: 'Caja y feriado', icon: 'banknote', route: '/clientes/caja', permission: 'cashier.view' },
          { id: 'cli-mods', title: 'Modificaciones autorizadas', icon: 'file-pen-line', route: '/clientes/modificaciones', permission: 'modifications.view' },
          { id: 'cli-engine', title: 'Motor financiero', icon: 'calculator', route: '/clientes/motor', permission: 'financial_engine.view' },
        ],
      },
      {
        id: 'credit', title: 'Crédito', icon: 'credit-card',
        permission: 'credit_lines.view',
        children: [
          { id: 'crd-lines', title: 'Líneas de crédito', icon: 'trending-up', route: '/credito/lineas', permission: 'credit_lines.view' },
          { id: 'crd-initial', title: 'Líneas iniciales', icon: 'circle-plus', route: '/credito/iniciales', permission: 'credit_lines.view' },
          { id: 'crd-incr', title: 'Incrementos', icon: 'circle-arrow-up', route: '/credito/incrementos', permission: 'credit_increments.view' },
          { id: 'crd-rest', title: 'Restricciones del 50 %', icon: 'alert-triangle', route: '/credito/restricciones', permission: 'credit_lines.view' },
          { id: 'crd-mov', title: 'Movimientos de línea', icon: 'arrow-left-right', route: '/credito/movimientos', permission: 'credit_lines.view' },
        ],
      },
      {
        id: 'collection', title: 'Relaciones y cobranza', icon: 'receipt-text',
        permission: 'relations.view',
        children: [
          { id: 'col-cuts', title: 'Cortes', icon: 'calendar-range', route: '/cobranza/cortes', permission: 'cuts.view' },
          { id: 'col-rels', title: 'Relaciones', icon: 'file-stack', route: '/cobranza/relaciones', permission: 'relations.view' },
          { id: 'col-part', title: 'Parcialidades', icon: 'split', route: '/cobranza/parcialidades', permission: 'relations.view' },
          { id: 'col-refs', title: 'Referencias de pago', icon: 'hash', route: '/cobranza/referencias', permission: 'payment_refs.view' },
          { id: 'col-bank', title: 'Archivo bancario', icon: 'file-down', route: '/cobranza/archivo-bancario', permission: 'bank_files.view' },
          { id: 'col-auto', title: 'Conciliación automática', icon: 'git-merge', route: '/cobranza/conciliacion-auto', permission: 'reconciliation.view' },
          { id: 'col-manual', title: 'Conciliación manual', icon: 'git-pull-request', route: '/cobranza/conciliacion-manual', permission: 'reconciliation.manual' },
          { id: 'col-clar', title: 'Aclaraciones', icon: 'message-square-warning', route: '/cobranza/aclaraciones', permission: 'clarifications.view' },
          { id: 'col-pays', title: 'Pagos', icon: 'banknote', route: '/cobranza/pagos', permission: 'payments.view' },
          { id: 'col-apply', title: 'Aplicación financiera', icon: 'circle-check', route: '/cobranza/aplicacion', permission: 'payments.view' },
          { id: 'col-sur', title: 'Recargos', icon: 'percent', route: '/cobranza/recargos', permission: 'surcharges.view' },
          { id: 'col-exc', title: 'Excedentes y devoluciones', icon: 'undo-2', route: '/cobranza/excedentes', permission: 'refunds.view' },
        ],
      },
      {
        id: 'points-risk', title: 'Puntos y riesgo', icon: 'gift',
        permission: 'points.view',
        children: [
          { id: 'pr-points', title: 'Puntos', icon: 'star', route: '/puntos/saldos', permission: 'points.view' },
          { id: 'pr-periods', title: 'Periodos de canje', icon: 'calendar-clock', route: '/puntos/periodos', permission: 'redemption_periods.view' },
          { id: 'pr-redemptions', title: 'Solicitudes de canje', icon: 'package-check', route: '/puntos/canjes', permission: 'redemptions.view' },
          { id: 'pr-alerts', title: 'Alertas de riesgo', icon: 'shield-alert', route: '/riesgo/alertas', permission: 'risk_alerts.view' },
          { id: 'pr-delinq', title: 'Morosidad', icon: 'octagon-alert', route: '/riesgo/morosidad', permission: 'delinquency.view' },
          { id: 'pr-reg', title: 'Regularización', icon: 'check-square', route: '/riesgo/regularizacion', permission: 'regularization.view' },
        ],
      },
      {
        id: 'mobility', title: 'Movilidad', icon: 'arrow-right-left',
        permission: 'transfers.view',
        children: [
          { id: 'mob-trans', title: 'Transferencias de clientes', icon: 'move', route: '/movilidad/transferencias', permission: 'transfers.view' },
          { id: 'mob-reass', title: 'Reasignaciones de clientes', icon: 'user-round-x', route: '/movilidad/reasignaciones', permission: 'reassignments.view' },
          { id: 'mob-branch', title: 'Cambios de sucursal', icon: 'building', route: '/movilidad/cambio-sucursal', permission: 'branch_changes.view' },
          { id: 'mob-coord', title: 'Cambios de coordinador', icon: 'user-cog', route: '/movilidad/cambio-coordinador', permission: 'coordinator_changes.view' },
          { id: 'mob-hist', title: 'Historial organizacional', icon: 'history', route: '/movilidad/historial', permission: 'org_history.view' },
        ],
      },
    ],
  },

  // ━━━ ADMINISTRACIÓN ━━━
  {
    heading: 'Administración',
    items: [
      {
        id: 'org', title: 'Organización', icon: 'building-2',
        permission: 'branches.view',
        children: [
          { id: 'org-branches', title: 'Sucursales', icon: 'map-pin', route: '/organizacion/sucursales', permission: 'branches.view' },
          { id: 'org-staff', title: 'Personal', icon: 'users', route: '/organizacion/personal', permission: 'staff.view' },
          { id: 'org-assign', title: 'Asignaciones', icon: 'link', route: '/organizacion/asignaciones', permission: 'assignments.view' },
          { id: 'org-struct', title: 'Estructura organizacional', icon: 'network', route: '/organizacion/estructura', permission: 'org_structure.view' },
        ],
      },
      {
        id: 'access', title: 'Usuarios y acceso', icon: 'user-cog',
        permission: 'users.view',
        children: [
          { id: 'acc-users', title: 'Usuarios', icon: 'users', route: '/usuarios', permission: 'users.view' },
          { id: 'acc-invites', title: 'Invitaciones', icon: 'mail-plus', route: '/invitaciones', permission: 'invitations.view' }
        ],
      },
      {
        id: 'config', title: 'Configuración global', icon: 'settings',
        permission: 'config.view',
        children: [
          { id: 'cfg-general', title: 'Configuraciones', icon: 'sliders-horizontal', route: '/configuracion/general', permission: 'config.view' },
          { id: 'cfg-cuts', title: 'Cortes y vencimientos', icon: 'calendar-range', route: '/configuracion/cortes', permission: 'config.cuts' },
          { id: 'cfg-credit', title: 'Crédito', icon: 'credit-card', route: '/configuracion/credito', permission: 'config.credit' },
          { id: 'cfg-surcharges', title: 'Recargos', icon: 'percent', route: '/configuracion/recargos', permission: 'config.surcharges' },
          { id: 'cfg-points', title: 'Puntos', icon: 'star', route: '/configuracion/puntos', permission: 'config.points' },
          { id: 'cfg-products', title: 'Productos', icon: 'package', route: '/productos', permission: 'products.view' },
          { id: 'cfg-categories', title: 'Categorías', icon: 'layers', route: '/categorias', permission: 'categories.manage' },
          { id: 'cfg-redemption', title: 'Periodos de canje', icon: 'calendar-clock', route: '/configuracion/periodos-canje', permission: 'config.redemption_periods' },
          { id: 'cfg-banking', title: 'Datos bancarios', icon: 'landmark', route: '/configuracion/datos-bancarios', permission: 'config.banking' },
          { id: 'cfg-publish', title: 'Publicación y vigencias', icon: 'globe', route: '/configuracion/publicacion', permission: 'config.publish' },
        ],
      },
    ],
  },

  // ━━━ CONTROL ━━━
  {
    heading: 'Control',
    items: [
      { id: 'ctrl-reports', title: 'Reportes', icon: 'chart-no-axes-combined', route: '/reportes', permission: 'reports.view' },
      { id: 'ctrl-audit', title: 'Auditoría', icon: 'scroll-text', route: '/auditoria', permission: 'audit.view' },
      { id: 'ctrl-logs', title: 'Logs', icon: 'file-terminal', route: '/logs', permission: 'logs.view' },
      { id: 'ctrl-files', title: 'Archivos', icon: 'folder-archive', route: '/archivos', permission: 'files.view' },
      { id: 'ctrl-procs', title: 'Procesos', icon: 'workflow', route: '/procesos', permission: 'processes.view' },
      { id: 'ctrl-status', title: 'Estado operativo', icon: 'activity', route: '/estado-operativo', permission: 'system_status.view' },
    ],
  },
];

// ─── Navegación inferior fija ────────────────────────────────

export const BOTTOM_ITEMS: NavItemData[] = [
  {
    id: 'my-account', title: 'Mi cuenta', icon: 'circle-user-round',
    children: [
      { id: 'my-profile', title: 'Mi perfil', icon: 'user', route: '/perfil' },
      { id: 'my-security', title: 'Seguridad', icon: 'shield-check', route: '/seguridad' },
    ],
  },
  { id: 'logout', title: 'Cerrar sesión', icon: 'log-out', action: 'logout' },
];
