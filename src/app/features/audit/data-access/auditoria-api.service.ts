import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api.config';

export interface AuditRecord {
  id: string;
  actor_id: string;
  actor_role: string;
  branch_id?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  event_name: string;
  event_type?: string | null;
  version?: number | null;
  previous_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  effective_from?: string | null;
  effective_to?: string | null;
  reason?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  request_id?: string | null;
  trace_id?: string | null;
  correlation_id?: string | null;
  result: 'SUCCESS' | 'FAILURE' | string;
  created_at: string;
  updated_at: string;
  evidence?: Record<string, unknown> | null;
  rule_snapshot?: Record<string, unknown> | null;
  actor?: {
    id: string;
    name: string;
    email: string;
  } | null;
  branch?: {
    id: string;
    name: string;
    code?: string;
  } | null;
}

export interface AuditPagination {
  current_page: number;
  data: AuditRecord[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface AuditFilters {
  search?: string;
  event_name?: string;
  event_names?: string[];
  entity_type?: string;
  actor_role?: string;
  result?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface AuditEventOption {
  event_name: string;
  entity_type: string | null;
}

export interface AuditFilterOptions {
  events: AuditEventOption[];
  actor_roles: string[];
  results: string[];
}

export interface OperationalLog {
  id: string;
  channel: string;
  level: string;
  event: string;
  request_id: string | null;
  correlation_id: string | null;
  trace_id: string | null;
  method: string | null;
  path: string | null;
  status_code: number | null;
  duration_ms: number | null;
  context: Record<string, unknown> | null;
  occurred_at: string;
}

export interface OperationalLogPagination extends Omit<AuditPagination, 'data'> {
  data: OperationalLog[];
}

export interface OperationalLogFilters {
  search?: string;
  channel?: string;
  level?: string;
  status_code?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export type AuditActionGroup =
  'CREATE' | 'UPDATE' | 'DELETE' | 'ACCESS' | 'READ' | 'PROCESS' | 'OTHER';

export const ACTION_LABELS_ES: Record<AuditActionGroup, string> = {
  CREATE: 'Creaciones y altas',
  UPDATE: 'Cambios y actualizaciones',
  DELETE: 'Bajas, cancelaciones y rechazos',
  ACCESS: 'Accesos, sesiones e invitaciones',
  READ: 'Consultas, descargas y exportaciones',
  PROCESS: 'Procesos, pagos y autorizaciones',
  OTHER: 'Otras acciones',
};

export const EVENT_LABELS_ES: Record<
  string,
  { label: string; category: string; icon: string; badgeColor: string }
> = {
  // Autenticación y Sesiones
  LOGIN_SUCCESSFUL: {
    label: 'Inicio de Sesión Exitoso',
    category: 'Sesión',
    icon: 'log-in',
    badgeColor: 'badge-blue',
  },
  LOGIN_FAILED: {
    label: 'Intento de Inicio Fallido',
    category: 'Sesión',
    icon: 'shield-alert',
    badgeColor: 'badge-red',
  },
  LOGOUT: {
    label: 'Cierre de Sesión',
    category: 'Sesión',
    icon: 'log-out',
    badgeColor: 'badge-gray',
  },
  PASSWORD_CHANGED: {
    label: 'Cambio de Contraseña',
    category: 'Seguridad',
    icon: 'key',
    badgeColor: 'badge-amber',
  },
  MFA_ENABLED: {
    label: 'Activación de MFA (2FA)',
    category: 'Seguridad',
    icon: 'shield-check',
    badgeColor: 'badge-green',
  },

  // Vales y Clientes
  VOUCHER_GENERATED: {
    label: 'Generación de Vale',
    category: 'Vales',
    icon: 'ticket',
    badgeColor: 'badge-emerald',
  },
  VOUCHER_CANCELLED: {
    label: 'Cancelación de Vale',
    category: 'Vales',
    icon: 'x-circle',
    badgeColor: 'badge-red',
  },
  CLIENT_CREATED: {
    label: 'Alta de Nuevo Cliente',
    category: 'Clientes',
    icon: 'user-plus',
    badgeColor: 'badge-green',
  },
  CLIENT_UPDATED: {
    label: 'Actualización de Cliente',
    category: 'Clientes',
    icon: 'user-check',
    badgeColor: 'badge-blue',
  },
  CLIENT_DELETED: {
    label: 'Eliminación de Cliente',
    category: 'Clientes',
    icon: 'user-x',
    badgeColor: 'badge-red',
  },

  // Créditos y Pagos
  'EV-READ-MOVEMENTS': {
    label: 'Consulta de Movimientos',
    category: 'Línea de Crédito',
    icon: 'eye',
    badgeColor: 'badge-slate',
  },
  CREDIT_LINE_ADJUSTED: {
    label: 'Ajuste de Línea de Crédito',
    category: 'Línea de Crédito',
    icon: 'trending-up',
    badgeColor: 'badge-purple',
  },
  PAYMENT_APPLIED: {
    label: 'Aplicación de Pago',
    category: 'Pagos',
    icon: 'credit-card',
    badgeColor: 'badge-green',
  },
  CUTOFF_EXECUTED: {
    label: 'Ejecución de Corte',
    category: 'Relaciones',
    icon: 'scissors',
    badgeColor: 'badge-amber',
  },

  // Puntos
  POINTS_REDEMPTION_REQUESTED: {
    label: 'Solicitud Canje de Puntos',
    category: 'Puntos',
    icon: 'coins',
    badgeColor: 'badge-amber',
  },
  POINTS_REDEMPTION_AUTHORIZED: {
    label: 'Autorización Canje de Puntos',
    category: 'Puntos',
    icon: 'check-circle-2',
    badgeColor: 'badge-blue',
  },
  POINTS_REDEMPTION_DELIVERED: {
    label: 'Entrega de Efectivo por Puntos',
    category: 'Puntos',
    icon: 'banknote',
    badgeColor: 'badge-green',
  },
  POINTS_REDEMPTION_REJECTED: {
    label: 'Rechazo de Canje de Puntos',
    category: 'Puntos',
    icon: 'x-circle',
    badgeColor: 'badge-red',
  },

  // Riesgo y Morosidad
  RISK_ALERT_GENERATED: {
    label: 'Alerta de Riesgo (3 Faltas)',
    category: 'Riesgo',
    icon: 'alert-triangle',
    badgeColor: 'badge-red',
  },
  DISTRIBUTOR_BLOCKED: {
    label: 'Bloqueo Operativo de Distribuidora',
    category: 'Riesgo',
    icon: 'lock',
    badgeColor: 'badge-red',
  },
  DISTRIBUTOR_RELEASED: {
    label: 'Levantamiento de Bloqueo',
    category: 'Riesgo',
    icon: 'unlock',
    badgeColor: 'badge-green',
  },
  DELINQUENCY_REMOVAL_REQUESTED: {
    label: 'Solicitud de Retiro de Morosidad',
    category: 'Riesgo',
    icon: 'file-text',
    badgeColor: 'badge-amber',
  },
  DELINQUENCY_REMOVAL_AUTHORIZED: {
    label: 'Autorización Retiro de Morosidad',
    category: 'Riesgo',
    icon: 'check-check',
    badgeColor: 'badge-green',
  },

  // Medios y Expedientes
  PRIVATE_MEDIA_DOWNLOADED: {
    label: 'Descarga de Expediente/Archivo',
    category: 'Archivos',
    icon: 'download',
    badgeColor: 'badge-indigo',
  },
  MEDIA_UPLOADED: {
    label: 'Carga de Documento',
    category: 'Archivos',
    icon: 'upload',
    badgeColor: 'badge-cyan',
  },
};

export const ROLE_LABELS_ES: Record<string, string> = {
  general_manager: 'Gerente General',
  branch_manager: 'Gerente de Sucursal',
  cashier: 'Cajera / Mostrador',
  coordinator: 'Coordinador',
  distributor: 'Distribuidora',
  admin: 'Administrador del Sistema',
  auditor: 'Auditor',
  system: 'Proceso Automático del Sistema',
};

export const ENTITY_LABELS_ES: Record<string, string> = {
  vouchers: 'Vales',
  voucher: 'Vales',
  Client: 'Clientes',
  clients: 'Clientes',
  credit_lines: 'Líneas de Crédito',
  media_file: 'Archivos / Expedientes',
  distributors: 'Distribuidoras',
  Distributor: 'Distribuidoras',
  distributor_application: 'Solicitudes de distribuidora',
  DistributorApplication: 'Solicitudes de distribuidora',
  payments: 'Pagos',
  users: 'Usuarios',
  User: 'Personal y usuarios',
  AccountInvitation: 'Invitaciones',
  branches: 'Sucursales',
  Branch: 'Sucursales',
  roles: 'Roles y Permisos',
  CoordinatorDistributorAssignment: 'Asignaciones de personal',
  point_accounts: 'Cuentas de Puntos',
  point_redemption_requests: 'Canjes de Puntos',
  distributor_risk_alerts: 'Alertas de Riesgo',
  distributor_operational_blocks: 'Bloqueos Operativos',
  delinquency_removal_requests: 'Retiros de Morosidad',
  distributor_relation: 'Relaciones',
  relations: 'Relaciones',
  configurations: 'Configuraciones',
  products: 'Productos',
  categories: 'Categorías',
  bank_imports: 'Archivos bancarios',
  refunds: 'Devoluciones',
};

@Injectable({ providedIn: 'root' })
export class AuditoriaApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getAudits(filters: AuditFilters = {}): Observable<AuditPagination> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          params = params.append(`${key}[]`, item);
        });
        return;
      }
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http
      .get<{ data: AuditPagination }>(`${this.config.baseUrl}/audit-logs`, { params })
      .pipe(map((response) => response.data));
  }

  getFilterOptions(): Observable<AuditFilterOptions> {
    return this.http
      .get<{ data: AuditFilterOptions }>(`${this.config.baseUrl}/audit-logs/options`)
      .pipe(map((response) => response.data));
  }

  getOperationalLogs(filters: OperationalLogFilters = {}): Observable<OperationalLogPagination> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http
      .get<{ data: OperationalLogPagination }>(`${this.config.baseUrl}/operational-logs`, {
        params,
      })
      .pipe(map((response) => response.data));
  }

  getActionGroup(eventName: string): AuditActionGroup {
    const event = eventName.toUpperCase();
    if (/(CREAT|GENERAT|ISSU|REGISTER|ADDED|OPENED)/.test(event)) return 'CREATE';
    if (/(DELET|REMOV|REVOK|CANCEL|REJECT|ENDED|DISABL|BLOCK)/.test(event)) return 'DELETE';
    if (/(LOGIN|LOGOUT|PASSWORD|MFA|SESSION|INVITATION|ACCESS|AUTHENTICAT)/.test(event))
      return 'ACCESS';
    if (/(VIEW|READ|DOWNLOAD|EXPORT|INSPECT|SEARCH|CONSULT)/.test(event)) return 'READ';
    if (/(PAY|CASH|RECONCIL|AUTHOR|APPROV|DELIVER|EXECUT|PROCESS|CUT|REDEEM|SETTLE)/.test(event))
      return 'PROCESS';
    if (
      /(UPDAT|CHANG|ADJUST|ASSIGN|PUBLISH|EDIT|CONFIGUR|RESEND|ACTIVAT|ENABLE|RELEASE|SUBMIT|CONFIRM)/.test(
        event,
      )
    )
      return 'UPDATE';
    return 'OTHER';
  }

  getEventInfo(eventName: string): {
    label: string;
    category: string;
    icon: string;
    badgeColor: string;
  } {
    if (EVENT_LABELS_ES[eventName]) {
      return EVENT_LABELS_ES[eventName];
    }
    // Fallback humanizer
    const cleaned = eventName
      .replace(/_/g, ' ')
      .replace(/^EV-/, '')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      label: cleaned,
      category: 'General',
      icon: 'activity',
      badgeColor: 'badge-slate',
    };
  }

  getRoleLabel(role: string): string {
    return ROLE_LABELS_ES[role] || role;
  }

  getEntityLabel(entity: string): string {
    return ENTITY_LABELS_ES[entity] || this.humanize(entity);
  }

  private humanize(value: string): string {
    return value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
  }
}
