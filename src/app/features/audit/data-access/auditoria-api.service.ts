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

export const FIELD_LABELS_ES: Record<string, string> = {
  // Personal / Usuario
  name: 'Nombre',
  email: 'Correo electrónico',
  normalized_email: 'Correo normalizado',
  phone: 'Teléfono',
  phone_number: 'Teléfono',
  mobile_phone: 'Celular',
  state: 'Estado de cuenta',
  password: 'Contraseña',
  curp: 'CURP',
  rfc: 'RFC',
  ine_number: 'Número de INE',
  birth_date: 'Fecha de nacimiento',
  gender: 'Género',
  marital_status: 'Estado civil',
  nationality: 'Nacionalidad',
  education_level: 'Nivel de estudios',

  // Dirección
  street: 'Calle',
  exterior_number: 'Número exterior',
  interior_number: 'Número interior',
  neighborhood: 'Colonia',
  city: 'Ciudad',
  municipality: 'Municipio',
  state_name: 'Estado',
  zip_code: 'Código postal',
  postal_code: 'Código postal',
  address: 'Dirección',
  validated_address: 'Dirección validada',

  // Financiero
  credit_limit: 'Límite de crédito',
  available_balance: 'Saldo disponible',
  used_balance: 'Saldo utilizado',
  amount: 'Monto',
  total_amount: 'Monto total',
  interest_rate: 'Tasa de interés',
  late_fee: 'Cargo por mora',
  payment_amount: 'Monto del pago',
  balance: 'Saldo',
  folio: 'Folio',
  voucher_folio: 'Folio de vale',
  distributor_number: 'Número de distribuidora',
  client_number: 'Número de cliente',

  // Estado / Workflow
  status: 'Estado',
  result: 'Resultado',
  outcome: 'Resultado',
  severity: 'Severidad',
  reason: 'Motivo',
  revocation_reason: 'Motivo de revocación',
  rejection_reason: 'Motivo de rechazo',
  cancellation_reason: 'Motivo de cancelación',
  notes: 'Notas',
  observations: 'Observaciones',
  comment: 'Comentario',
  comments: 'Comentarios',

  // Organización
  branch_id: 'Sucursal',
  branch_name: 'Nombre de sucursal',
  role: 'Rol',
  role_code: 'Código de rol',
  category: 'Categoría',
  category_name: 'Nombre de categoría',
  product_name: 'Nombre del producto',
  code: 'Código',

  // Fechas
  created_at: 'Fecha de creación',
  updated_at: 'Fecha de actualización',
  activated_at: 'Fecha de activación',
  expires_at: 'Fecha de expiración',
  revoked_at: 'Fecha de revocación',
  scheduled_for: 'Programado para',
  effective_from: 'Vigente desde',
  effective_to: 'Vigente hasta',
  due_date: 'Fecha de vencimiento',
  payment_date: 'Fecha de pago',
  cutoff_date: 'Fecha de corte',

  // Seguridad
  ip_address: 'Dirección IP',
  user_agent: 'Navegador',
  device: 'Dispositivo',
  mfa_method: 'Método MFA',
  authentication_method: 'Método de autenticación',

  // Verificación
  verification_result: 'Resultado de verificación',
  verifier_id: 'Verificador',
  coordinator_id: 'Coordinador',
  evaluation_result: 'Resultado de evaluación',
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

  getFieldLabel(field: string): string {
    return FIELD_LABELS_ES[field] || this.humanize(field);
  }

  formatValue(value: unknown): string {
    if (value === null || value === undefined) return '(vacío)';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
      if (value === '') return '(vacío)';
      if (value.length > 80) return value.substring(0, 77) + '...';
      return value;
    }
    if (Array.isArray(value)) return value.map((item) => this.formatValue(item)).join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  getChangedFields(
    audit: AuditRecord,
  ): { field: string; label: string; oldValue: string; newValue: string }[] {
    const prev = audit.previous_value ?? {};
    const next = audit.new_value ?? {};
    const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
    const changes: { field: string; label: string; oldValue: string; newValue: string }[] = [];

    const skipKeys = new Set([
      'id',
      'created_at',
      'updated_at',
      'deleted_at',
      'device',
      'security_event_id',
      'password',
    ]);

    allKeys.forEach((key) => {
      if (skipKeys.has(key)) return;
      const oldVal = prev[key];
      const newVal = next[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          label: this.getFieldLabel(key),
          oldValue: this.formatValue(oldVal),
          newValue: this.formatValue(newVal),
        });
      }
    });

    return changes;
  }

  describeAction(audit: AuditRecord): string {
    const event = audit.event_name;
    const actorName = audit.actor?.name ?? 'Un usuario';
    const entityLabel = this.getEntityLabel(audit.entity_type || '').toLowerCase();
    const newVal = audit.new_value ?? {};
    const prevVal = audit.previous_value ?? {};
    const targetName =
      (newVal['name'] as string) ||
      (newVal['email'] as string) ||
      (newVal['folio'] as string) ||
      (newVal['voucher_folio'] as string) ||
      (newVal['distributor_number'] as string) ||
      (newVal['client_number'] as string) ||
      '';

    // --- Accesos y Seguridad ---
    if (event === 'LOGIN_SUCCESSFUL') return `${actorName} inició sesión`;
    if (event === 'LOGIN_FAILED')
      return `Intento fallido de inicio de sesión${newVal['email'] ? ' con ' + (newVal['email'] as string) : ''}`;
    if (event === 'LOGOUT') return `${actorName} cerró sesión`;
    if (event === 'PASSWORD_CHANGED') return `${actorName} cambió su contraseña`;
    if (event === 'MFA_ENABLED') return `${actorName} activó la autenticación de dos pasos (MFA)`;

    // --- Vales ---
    if (event === 'VOUCHER_GENERATED') {
      const folio = (newVal['folio'] as string) || (newVal['voucher_folio'] as string) || '';
      const amount = newVal['amount'] || newVal['total_amount'] || '';
      let desc = `${actorName} generó un vale`;
      if (folio) desc += ` con folio ${folio}`;
      if (amount) desc += ` por $${amount}`;
      return desc;
    }
    if (event === 'VOUCHER_CANCELLED' || event === 'VOUCHER_CANCELLED_BY_DISTRIBUTOR') {
      const folio = (newVal['folio'] as string) || (prevVal['folio'] as string) || '';
      return `${actorName} canceló el vale${folio ? ' ' + folio : ''}`;
    }
    if (event === 'VOUCHER_RELEASED') {
      const folio = (newVal['folio'] as string) || '';
      return `${actorName} liberó el vale${folio ? ' ' + folio : ''}`;
    }
    if (event === 'VOUCHER_CASHED') {
      const folio = (newVal['folio'] as string) || '';
      return `${actorName} cobró el vale${folio ? ' ' + folio : ''}`;
    }
    if (event.startsWith('VOUCHER_MODIFICATION')) {
      if (event.includes('REQUESTED')) return `${actorName} solicitó modificación de vale`;
      if (event.includes('AUTHORIZED')) return `${actorName} autorizó modificación de vale`;
      if (event.includes('REJECTED')) return `${actorName} rechazó modificación de vale`;
      if (event.includes('APPLIED')) return `${actorName} aplicó la modificación de vale`;
    }

    // --- Clientes ---
    if (event === 'CLIENT_CREATED') {
      return `${actorName} dio de alta al cliente${targetName ? ' "' + targetName + '"' : ''}`;
    }
    if (event === 'CLIENT_UPDATED') {
      const changes = this.getChangedFields(audit);
      if (changes.length > 0) {
        const fieldList = changes
          .slice(0, 3)
          .map((c) => c.label.toLowerCase())
          .join(', ');
        return `${actorName} editó ${fieldList} del cliente`;
      }
      return `${actorName} actualizó datos del cliente`;
    }
    if (event === 'CLIENT_DELETED') {
      return `${actorName} eliminó al cliente${targetName ? ' "' + targetName + '"' : ''}`;
    }

    // --- Créditos ---
    if (event === 'CREDIT_LINE_ADJUSTED') {
      const amount = newVal['amount'] || newVal['credit_limit'] || '';
      return `${actorName} ajustó la línea de crédito${amount ? ' a $' + amount : ''}`;
    }

    // --- Pagos ---
    if (event === 'PAYMENT_APPLIED') {
      const amount = newVal['amount'] || newVal['payment_amount'] || '';
      return `${actorName} aplicó un pago${amount ? ' de $' + amount : ''}`;
    }
    if (event === 'CUTOFF_EXECUTED') return `${actorName} ejecutó un corte de relación`;

    // --- Puntos ---
    if (event === 'POINTS_REDEMPTION_REQUESTED') return `${actorName} solicitó un canje de puntos`;
    if (event === 'POINTS_REDEMPTION_AUTHORIZED') return `${actorName} autorizó un canje de puntos`;
    if (event === 'POINTS_REDEMPTION_DELIVERED')
      return `${actorName} entregó el efectivo del canje de puntos`;
    if (event === 'POINTS_REDEMPTION_REJECTED') return `${actorName} rechazó un canje de puntos`;

    // --- Distribuidoras ---
    if (event === 'DISTRIBUTOR_BLOCKED') return `${actorName} bloqueó a la distribuidora`;
    if (event === 'DISTRIBUTOR_RELEASED')
      return `${actorName} levantó el bloqueo de la distribuidora`;
    if (event === 'RISK_ALERT_GENERATED') return `Se generó una alerta de riesgo`;
    if (event === 'DELINQUENCY_REMOVAL_REQUESTED')
      return `${actorName} solicitó retiro de morosidad`;
    if (event === 'DELINQUENCY_REMOVAL_AUTHORIZED')
      return `${actorName} autorizó retiro de morosidad`;

    // --- Archivos ---
    if (event === 'PRIVATE_MEDIA_DOWNLOADED')
      return `${actorName} descargó un archivo de ${entityLabel || 'expediente'}`;
    if (event === 'MEDIA_UPLOADED') return `${actorName} cargó un documento`;
    if (event === 'PRIVATE_MEDIA_STORED') return `${actorName} almacenó un archivo`;

    // --- Solicitudes de distribuidora ---
    if (event === 'APPLICATION_MANAGER_APPROVED')
      return `${actorName} aprobó la solicitud de distribuidora`;
    if (event === 'APPLICATION_MANAGER_REJECTED')
      return `${actorName} rechazó la solicitud de distribuidora`;
    if (event === 'APPLICATION_COORDINATOR_EVALUATED')
      return `${actorName} evaluó la solicitud de distribuidora`;
    if (event === 'APPLICATION_SENT_TO_MANAGER')
      return `${actorName} envió la solicitud al gerente`;
    if (event === 'APPLICATION_CORRECTION_APPLIED')
      return `${actorName} aplicó correcciones a la solicitud`;
    if (event === 'APPLICATION_CORRECTIONS_COMPLETED')
      return `${actorName} completó las correcciones de la solicitud`;
    if (event.includes('DISTRIBUTOR_APPLICATION_RETURNED'))
      return `${actorName} devolvió la solicitud al verificador`;

    // --- Verificación ---
    if (event === 'VERIFICATION_ACCESS_DENIED')
      return `Se denegó acceso de verificación a ${actorName}`;
    if (event === 'VERIFICATION_EVIDENCE_UPLOADED')
      return `${actorName} cargó evidencia de verificación`;
    if (event === 'VERIFICATION_EVIDENCE_REMOVED')
      return `${actorName} eliminó evidencia de verificación`;

    // --- Genérico por patrón ---
    const group = this.getActionGroup(event);
    if (group === 'CREATE') {
      return `${actorName} creó un registro en ${entityLabel || 'el sistema'}${targetName ? ': "' + targetName + '"' : ''}`;
    }
    if (group === 'UPDATE') {
      const changes = this.getChangedFields(audit);
      if (changes.length > 0) {
        const fieldList = changes
          .slice(0, 3)
          .map((c) => c.label.toLowerCase())
          .join(', ');
        const suffix = changes.length > 3 ? ` y ${changes.length - 3} campo(s) más` : '';
        return `${actorName} editó ${fieldList}${suffix} en ${entityLabel || 'el sistema'}`;
      }
      return `${actorName} actualizó ${entityLabel || 'un registro'}`;
    }
    if (group === 'DELETE') {
      return `${actorName} eliminó/canceló un registro de ${entityLabel || 'el sistema'}`;
    }
    if (group === 'PROCESS') {
      return `${actorName} procesó una operación en ${entityLabel || 'el sistema'}`;
    }
    if (group === 'READ') {
      return `${actorName} consultó ${entityLabel || 'información del sistema'}`;
    }

    // Fallback
    const eventInfo = this.getEventInfo(event);
    return `${actorName} realizó: ${eventInfo.label}`;
  }
}
