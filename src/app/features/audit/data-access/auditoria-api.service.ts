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

export interface ChangedFieldDetail {
  field: string;
  label: string;
  oldValue: string;
  rawOld: unknown;
  newValue: string;
  rawNew: unknown;
  isCreation: boolean;
  isDeletion: boolean;
}

export type AuditActionGroup =
  | 'AUTH'
  | 'SOLICITUDES'
  | 'DISTRIBUIDORAS'
  | 'VALES'
  | 'CLIENTES'
  | 'PAGOS'
  | 'CREDITOS'
  | 'DOCUMENTOS'
  | 'CONFIGURACION'
  | 'SISTEMA';

export const ACTION_LABELS_ES: Record<AuditActionGroup, string> = {
  AUTH: 'Seguridad y Accesos',
  SOLICITUDES: 'Solicitudes de Distribuidora',
  DISTRIBUIDORAS: 'Gestión de Distribuidoras',
  VALES: 'Operación de Vales',
  CLIENTES: 'Padrón de Clientes',
  PAGOS: 'Cobranza y Conciliación',
  CREDITOS: 'Líneas de Crédito',
  DOCUMENTOS: 'Documentos y Archivos',
  CONFIGURACION: 'Configuración y Roles',
  SISTEMA: 'Eventos del Sistema',
};

export const ROLE_LABELS_ES: Record<string, string> = {
  admin: 'Administrador del Sistema',
  general_manager: 'Gerente General',
  branch_manager: 'Gerente de Sucursal',
  coordinator: 'Coordinador',
  verifier: 'Verificador',
  distributor: 'Distribuidora',
  cashier: 'Cajero',
  support: 'Soporte Técnico',
};

export const ENTITY_LABELS_ES: Record<string, string> = {
  distributor_application: 'Solicitud de Distribuidora',
  distributor: 'Distribuidora',
  distributor_relation: 'Relación de Distribuidora',
  client: 'Cliente',
  voucher: 'Vale',
  payment: 'Pago',
  payment_clarification: 'Aclaración de Pago',
  credit_line: 'Línea de Crédito',
  credit_lines: 'Líneas de Crédito',
  credit_limit_request: 'Solicitud de Incremento',
  manual_reconciliation_request: 'Conciliación Manual',
  bank_file_import: 'Importación Bancaria',
  distributor_surplus: 'Excedente de Pago',
  surplus_refund_request: 'Devolución de Excedente',
  surplus_application: 'Aplicación de Excedente',
  verification_visit: 'Visita de Verificación',
  media_file: 'Archivo Digital',
  user: 'Usuario',
  role: 'Rol y Permisos',
  Client: 'Cliente',
  User: 'Usuario',
  Sistema: 'Sistema',
};

export const EVENT_LABELS_ES: Record<
  string,
  { label: string; category: string; icon: string; badgeColor: string }
> = {
  // Autenticación y Seguridad
  LOGIN_SUCCESSFUL: {
    label: 'Inicio de Sesión',
    category: 'Seguridad',
    icon: 'log-in',
    badgeColor: 'badge-emerald',
  },
  LOGIN_FAILED: {
    label: 'Intento de Acceso Fallido',
    category: 'Seguridad',
    icon: 'shield-alert',
    badgeColor: 'badge-red',
  },
  LOGOUT: {
    label: 'Cierre de Sesión',
    category: 'Seguridad',
    icon: 'log-out',
    badgeColor: 'badge-slate',
  },
  PASSWORD_RESET: {
    label: 'Restablecimiento de Contraseña',
    category: 'Seguridad',
    icon: 'key',
    badgeColor: 'badge-amber',
  },
  PASSWORD_CHANGED: {
    label: 'Cambio de Contraseña',
    category: 'Seguridad',
    icon: 'key',
    badgeColor: 'badge-blue',
  },
  MFA_SETUP_COMPLETED: {
    label: 'Configuración MFA Completada',
    category: 'Seguridad',
    icon: 'shield-check',
    badgeColor: 'badge-emerald',
  },
  WEBAUTHN_REGISTERED: {
    label: 'Biometría / Llave Registrada',
    category: 'Seguridad',
    icon: 'shield-check',
    badgeColor: 'badge-emerald',
  },
  INVITATION_USED: {
    label: 'Invitación Activada',
    category: 'Seguridad',
    icon: 'key',
    badgeColor: 'badge-indigo',
  },
  SESSION_REVOKED: {
    label: 'Sesión Revocada',
    category: 'Seguridad',
    icon: 'log-out',
    badgeColor: 'badge-red',
  },

  // Solicitudes de Distribuidora
  DISTRIBUTOR_APPLICATION_CREATED: {
    label: 'Alta de Solicitud (Borrador)',
    category: 'Solicitudes',
    icon: 'file-plus',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_UPDATED: {
    label: 'Actualización de Solicitud',
    category: 'Solicitudes',
    icon: 'pen-tool',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_SUBMITTED: {
    label: 'Envío a Revisión',
    category: 'Solicitudes',
    icon: 'send',
    badgeColor: 'badge-purple',
  },
  DISTRIBUTOR_APPLICATION_PERSONAL_DATA_UPDATED: {
    label: 'Actualización de Datos Personales',
    category: 'Solicitudes',
    icon: 'user-check',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_RESIDENCE_ADDED: {
    label: 'Registro de Domicilio',
    category: 'Solicitudes',
    icon: 'house',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_RESIDENCE_UPDATED: {
    label: 'Actualización de Domicilio',
    category: 'Solicitudes',
    icon: 'house',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_RESIDENCE_REMOVED: {
    label: 'Eliminación de Domicilio',
    category: 'Solicitudes',
    icon: 'house',
    badgeColor: 'badge-red',
  },
  DISTRIBUTOR_APPLICATION_COMMERCIAL_CREDIT_ADDED: {
    label: 'Registro de Crédito Comercial',
    category: 'Solicitudes',
    icon: 'credit-card',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_COMMERCIAL_CREDIT_UPDATED: {
    label: 'Actualización de Crédito Comercial',
    category: 'Solicitudes',
    icon: 'credit-card',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_COMMERCIAL_CREDIT_REMOVED: {
    label: 'Eliminación de Crédito Comercial',
    category: 'Solicitudes',
    icon: 'credit-card',
    badgeColor: 'badge-red',
  },
  DISTRIBUTOR_APPLICATION_VEHICLE_ADDED: {
    label: 'Registro de Vehículo',
    category: 'Solicitudes',
    icon: 'truck',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_VEHICLE_UPDATED: {
    label: 'Actualización de Vehículo',
    category: 'Solicitudes',
    icon: 'truck',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_VEHICLE_REMOVED: {
    label: 'Eliminación de Vehículo',
    category: 'Solicitudes',
    icon: 'truck',
    badgeColor: 'badge-red',
  },
  DISTRIBUTOR_APPLICATION_EMPLOYMENT_ADDED: {
    label: 'Registro de Empleo / Actividad',
    category: 'Solicitudes',
    icon: 'briefcase',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_EMPLOYMENT_UPDATED: {
    label: 'Actualización de Empleo',
    category: 'Solicitudes',
    icon: 'briefcase',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_EMPLOYMENT_REMOVED: {
    label: 'Eliminación de Empleo',
    category: 'Solicitudes',
    icon: 'briefcase',
    badgeColor: 'badge-red',
  },
  DISTRIBUTOR_APPLICATION_FAMILY_MEMBER_ADDED: {
    label: 'Registro de Familiar',
    category: 'Solicitudes',
    icon: 'users',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_FAMILY_MEMBER_UPDATED: {
    label: 'Actualización de Familiar',
    category: 'Solicitudes',
    icon: 'users',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_FAMILY_MEMBER_REMOVED: {
    label: 'Eliminación de Familiar',
    category: 'Solicitudes',
    icon: 'users',
    badgeColor: 'badge-red',
  },
  DISTRIBUTOR_APPLICATION_ASSET_LIABILITY_ADDED: {
    label: 'Registro de Patrimonio / Bienes',
    category: 'Solicitudes',
    icon: 'landmark',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_ASSET_LIABILITY_UPDATED: {
    label: 'Actualización de Patrimonio',
    category: 'Solicitudes',
    icon: 'landmark',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_APPLICATION_ASSET_LIABILITY_REMOVED: {
    label: 'Eliminación de Patrimonio',
    category: 'Solicitudes',
    icon: 'landmark',
    badgeColor: 'badge-red',
  },
  DISTRIBUTOR_APPLICATION_RETURNED_TO_DRAFT: {
    label: 'Devolución a Captura',
    category: 'Solicitudes',
    icon: 'undo-2',
    badgeColor: 'badge-amber',
  },

  // Verificación y Coordinación
  VERIFICATION_VISIT_ASSIGNED: {
    label: 'Asignación de Verificador',
    category: 'Verificación',
    icon: 'calendar-plus',
    badgeColor: 'badge-blue',
  },
  VERIFICATION_VISIT_RESCHEDULED: {
    label: 'Reprogramación de Visita',
    category: 'Verificación',
    icon: 'calendar-clock',
    badgeColor: 'badge-amber',
  },
  VERIFICATION_VISIT_STARTED: {
    label: 'Inicio de Visita en Campo',
    category: 'Verificación',
    icon: 'map-pin',
    badgeColor: 'badge-amber',
  },
  VERIFICATION_DIFFERENCE_RECORDED: {
    label: 'Registro de Diferencia en Visita',
    category: 'Verificación',
    icon: 'circle-alert',
    badgeColor: 'badge-amber',
  },
  VERIFICATION_VISIT_COMPLETED: {
    label: 'Finalización de Visita',
    category: 'Verificación',
    icon: 'circle-check',
    badgeColor: 'badge-emerald',
  },
  VERIFICATION_EVIDENCE_UPLOADED: {
    label: 'Carga de Fotografía de Visita',
    category: 'Verificación',
    icon: 'camera',
    badgeColor: 'badge-blue',
  },
  VERIFICATION_EVIDENCE_REMOVED: {
    label: 'Eliminación de Fotografía de Visita',
    category: 'Verificación',
    icon: 'trash-2',
    badgeColor: 'badge-red',
  },
  VERIFICATION_ACCESS_DENIED: {
    label: 'Acceso Denegado a Verificación',
    category: 'Seguridad',
    icon: 'shield-alert',
    badgeColor: 'badge-red',
  },
  APPLICATION_CORRECTION_APPLIED: {
    label: 'Corrección de Diferencia Aplicada',
    category: 'Coordinación',
    icon: 'check',
    badgeColor: 'badge-blue',
  },
  APPLICATION_CORRECTIONS_COMPLETED: {
    label: 'Correcciones Completadas',
    category: 'Coordinación',
    icon: 'check-check',
    badgeColor: 'badge-emerald',
  },
  APPLICATION_COORDINATOR_EVALUATED: {
    label: 'Evaluación de Coordinación',
    category: 'Coordinación',
    icon: 'clipboard-check',
    badgeColor: 'badge-purple',
  },
  APPLICATION_SENT_TO_MANAGER: {
    label: 'Envío a Dictamen Gerencial',
    category: 'Coordinación',
    icon: 'arrow-up-right',
    badgeColor: 'badge-indigo',
  },
  APPLICATION_TERMINATED_UNFAVORABLE: {
    label: 'Solicitud Dictaminada Desfavorable',
    category: 'Dictamen',
    icon: 'circle-x',
    badgeColor: 'badge-red',
  },
  APPLICATION_MANAGER_APPROVED: {
    label: 'Aprobación de Solicitud (Línea Otorgada)',
    category: 'Dictamen',
    icon: 'circle-check',
    badgeColor: 'badge-emerald',
  },
  APPLICATION_MANAGER_REJECTED: {
    label: 'Rechazo de Solicitud de Distribuidora',
    category: 'Dictamen',
    icon: 'circle-x',
    badgeColor: 'badge-red',
  },

  // Documentos y Archivos
  PRIVATE_MEDIA_DOWNLOADED: {
    label: 'Descarga de Documento Privado',
    category: 'Documentos',
    icon: 'download',
    badgeColor: 'badge-cyan',
  },
  PRIVATE_MEDIA_STORED: {
    label: 'Carga de Documento Digital',
    category: 'Documentos',
    icon: 'upload',
    badgeColor: 'badge-blue',
  },
  MEDIA_UPLOADED: {
    label: 'Carga de Expediente',
    category: 'Documentos',
    icon: 'upload',
    badgeColor: 'badge-blue',
  },

  // Vales
  VOUCHER_GENERATED: {
    label: 'Emisión de Vale',
    category: 'Vales',
    icon: 'ticket',
    badgeColor: 'badge-indigo',
  },
  VOUCHER_CANCELLED: {
    label: 'Cancelación de Vale',
    category: 'Vales',
    icon: 'circle-x',
    badgeColor: 'badge-red',
  },
  VOUCHER_CANCELLED_BY_DISTRIBUTOR: {
    label: 'Cancelación por Distribuidora',
    category: 'Vales',
    icon: 'circle-x',
    badgeColor: 'badge-red',
  },
  VOUCHER_RELEASED: {
    label: 'Liberación de Vale',
    category: 'Vales',
    icon: 'circle-check',
    badgeColor: 'badge-emerald',
  },
  VOUCHER_CASHED: {
    label: 'Cobro en Caja de Vale',
    category: 'Vales',
    icon: 'banknote',
    badgeColor: 'badge-emerald',
  },
  VOUCHER_MODIFICATION_REQUESTED: {
    label: 'Solicitud de Modificación de Vale',
    category: 'Vales',
    icon: 'pen-tool',
    badgeColor: 'badge-amber',
  },
  VOUCHER_MODIFICATION_APPROVED: {
    label: 'Modificación de Vale Aprobada',
    category: 'Vales',
    icon: 'check',
    badgeColor: 'badge-emerald',
  },
  VOUCHER_MODIFICATION_APPLIED: {
    label: 'Modificación de Vale Aplicada',
    category: 'Vales',
    icon: 'check-check',
    badgeColor: 'badge-emerald',
  },

  // Clientes
  CLIENT_CREATED: {
    label: 'Alta de Cliente',
    category: 'Clientes',
    icon: 'user-plus',
    badgeColor: 'badge-emerald',
  },
  CLIENT_UPDATED: {
    label: 'Edición de Datos de Cliente',
    category: 'Clientes',
    icon: 'user-check',
    badgeColor: 'badge-blue',
  },
  CLIENT_DELETED: {
    label: 'Baja de Cliente',
    category: 'Clientes',
    icon: 'user-x',
    badgeColor: 'badge-red',
  },

  // Líneas de Crédito y Consultas
  'EV-READ-LINE': {
    label: 'Consulta de Línea de Crédito',
    category: 'Créditos',
    icon: 'file-text',
    badgeColor: 'badge-slate',
  },
  'EV-READ-MOVEMENTS': {
    label: 'Consulta de Movimientos',
    category: 'Créditos',
    icon: 'activity',
    badgeColor: 'badge-slate',
  },
  CREDIT_LINE_REQUEST_CREATED: {
    label: 'Solicitud de Incremento de Línea',
    category: 'Créditos',
    icon: 'trending-up',
    badgeColor: 'badge-blue',
  },
  CREDIT_LINE_ADJUSTED: {
    label: 'Ajuste de Línea de Crédito',
    category: 'Créditos',
    icon: 'credit-card',
    badgeColor: 'badge-emerald',
  },
  CUTOFF_EXECUTED: {
    label: 'Ejecución de Corte Quincenal',
    category: 'Créditos',
    icon: 'scissors',
    badgeColor: 'badge-purple',
  },

  // Pagos y Conciliación
  PAYMENT_APPLIED: {
    label: 'Aplicación de Pago',
    category: 'Pagos',
    icon: 'coins',
    badgeColor: 'badge-emerald',
  },
  PAYMENT_CLARIFICATION_CREATED: {
    label: 'Registro de Aclaración de Pago',
    category: 'Pagos',
    icon: 'circle-alert',
    badgeColor: 'badge-amber',
  },
  PAYMENT_CLARIFICATION_RESOLVED: {
    label: 'Aclaración de Pago Resuelta',
    category: 'Pagos',
    icon: 'circle-check',
    badgeColor: 'badge-emerald',
  },
  EXCESS_CREATED: {
    label: 'Excedente de Pago Detectado',
    category: 'Pagos',
    icon: 'banknote',
    badgeColor: 'badge-blue',
  },
  REFUND_REQUESTED: {
    label: 'Solicitud de Devolución de Excedente',
    category: 'Pagos',
    icon: 'undo-2',
    badgeColor: 'badge-amber',
  },
  REFUND_COMPLETED: {
    label: 'Devolución de Excedente Completada',
    category: 'Pagos',
    icon: 'circle-check',
    badgeColor: 'badge-emerald',
  },
  REFUND_CANCELLED: {
    label: 'Devolución de Excedente Cancelada',
    category: 'Pagos',
    icon: 'circle-x',
    badgeColor: 'badge-red',
  },

  // Distribuidoras
  DISTRIBUTOR_ACCESS_ACTIVATED: {
    label: 'Activación de Acceso de Distribuidora',
    category: 'Distribuidoras',
    icon: 'circle-check',
    badgeColor: 'badge-emerald',
  },
  DISTRIBUTOR_COORDINATOR_ASSIGNED: {
    label: 'Asignación de Coordinador',
    category: 'Distribuidoras',
    icon: 'user-check',
    badgeColor: 'badge-blue',
  },
  DISTRIBUTOR_CATEGORY_ASSIGNED: {
    label: 'Asignación de Categoría',
    category: 'Distribuidoras',
    icon: 'tag',
    badgeColor: 'badge-indigo',
  },
  DISTRIBUTOR_STATUS_CHANGED: {
    label: 'Cambio de Estado Operativo',
    category: 'Distribuidoras',
    icon: 'activity',
    badgeColor: 'badge-amber',
  },
  DISTRIBUTOR_BRANCH_TRANSFERRED: {
    label: 'Traspaso de Sucursal',
    category: 'Distribuidoras',
    icon: 'building',
    badgeColor: 'badge-purple',
  },
};

export const FIELD_LABELS_ES: Record<string, string> = {
  // Solicitud y Datos Personales
  first_name: 'Nombre(s)',
  last_name: 'Primer Apellido',
  first_last_name: 'Primer Apellido',
  second_last_name: 'Segundo Apellido',
  name: 'Nombre / Concepto',
  email: 'Correo Electrónico',
  phone: 'Teléfono',
  phone_number: 'Teléfono',
  mobile_phone: 'Celular',
  birth_date: 'Fecha de Nacimiento',
  birth_place: 'Lugar de Nacimiento',
  birth_city: 'Ciudad de Nacimiento',
  birth_state: 'Estado de Nacimiento',
  birth_country: 'País de Nacimiento',
  gender: 'Género',
  marital_status: 'Estado Civil',
  civil_status: 'Estado Civil',
  nationality: 'Nacionalidad',
  identification_country: 'País de Identificación',
  official_id_type: 'Tipo de Identificación',
  official_id_number: 'Folio de Identificación',
  curp: 'CURP',
  rfc: 'RFC',

  // Domicilio
  housing_tenure: 'Tipo de Vivienda / Tenencia',
  financing_status: 'Situación de Financiamiento',
  street: 'Calle',
  exterior_number: 'Número Exterior',
  interior_number: 'Número Interior',
  neighborhood: 'Colonia',
  city: 'Ciudad',
  municipality: 'Municipio',
  state: 'Estado',
  postal_code: 'Código Postal',
  zip_code: 'Código Postal',
  country: 'País',
  years_at_residence: 'Años en el Domicilio',
  is_current: 'Registro Actual / Vigente',
  is_active: 'Activo / Vigente',

  // Patrimonio y Bienes
  entry_type: 'Tipo de Concepto',
  amount: 'Monto / Valor Comercial',
  estimated_value: 'Valor Estimado',
  outstanding_balance: 'Saldo Pendiente',
  monthly_payment: 'Pago Mensual',
  description: 'Descripción',

  // Crédito Comercial
  company_name: 'Empresa / Comercio',
  credit_limit: 'Límite de Crédito',
  account_number: 'Número de Cuenta',
  proof_type: 'Tipo de Comprobante',
  proof_reference: 'Referencia de Comprobante',
  has_evidence: 'Cuenta con Evidencia',

  // Vehículos
  vehicle_type: 'Tipo de Vehículo',
  ownership_status: 'Tipo de Propiedad',
  model_year: 'Año del Modelo',
  brand: 'Marca',
  model: 'Modelo',
  plates: 'Placas',

  // Empleo
  employer_name: 'Empresa / Empleador',
  job_title: 'Puesto / Cargo',
  position: 'Puesto / Ocupación',
  monthly_income: 'Ingreso Mensual',
  started_at: 'Fecha de Ingreso',
  ended_at: 'Fecha de Término',

  // Familiar
  relationship: 'Parentesco',
  declared_age: 'Edad',
  school_name: 'Escuela / Grado',
  is_economic_dependent: 'Dependiente Económico',
  economic_dependency: 'Dependiente Económico',
  is_family_reference: 'Referencia Familiar',

  // Operación y Dictamen
  status: 'Estado',
  result: 'Resultado',
  reason: 'Motivo',
  observations: 'Observaciones',
  decision: 'Dictamen / Decisión',
  initial_credit_line_amount: 'Línea de Crédito Inicial',
  total_amount: 'Monto Total',
  payment_amount: 'Monto de Pago',
  credit_line_amount: 'Línea de Crédito',
  branch_id: 'Sucursal',
  coordinator_id: 'Coordinador',
  verifier_id: 'ID de Verificador',
  verifier_name: 'Verificador Asignado',
  verifier_email: 'Correo del Verificador',
  scheduled_for: 'Fecha y Hora Programada',
  has_differences: 'Diferencias Reportadas',
  total_differences: 'Total de Diferencias Observadas',
  completed_at: 'Fecha de Finalización',
  visited_at: 'Fecha de Visita',
  field: 'Campo Modificado',
  details_payload: 'Detalles Adicionales',
  reference_payload: 'Datos de Referencia',

  // Archivos y Evidencias
  file_name: 'Nombre del Archivo',
  original_name: 'Nombre del Archivo',
  file_type: 'Tipo de Evidencia / Archivo',
  file_size: 'Tamaño del Archivo',
  size_bytes: 'Tamaño del Archivo',
  mime_type: 'Tipo MIME / Formato',
  sha256: 'Firma Digital (SHA-256)',
  purpose: 'Propósito del Archivo',
  purposes: 'Propósitos del Archivo',
  owner_type: 'Tipo de Registro Asociado',
  owner_id: 'ID de Registro Asociado',
};

export const VALUE_LABELS_ES: Record<string, string> = {
  // Estados de solicitud
  DRAFT: 'Borrador / Captura',
  COORDINATOR_REVIEW: 'Revisión de Coordinación',
  PHYSICAL_VERIFICATION: 'Verificación Física',
  COORDINATOR_CORRECTION: 'Corrección de Diferencias',
  COORDINATOR_EVALUATION: 'Evaluación de Coordinación',
  MANAGER_AUTHORIZATION: 'Autorización Gerencial',
  AUTHORIZED_PENDING_ACTIVATION: 'Autorizada (Pendiente Activación)',
  ACTIVE: 'Activa',
  REJECTED: 'Rechazada',
  TERMINATED: 'Finalizada Desfavorable',
  RETURNED_TO_DRAFT: 'Devuelta a Captura',

  // Tipos de Patrimonio
  ASSET: 'Activo (Propiedad / Bien)',
  LIABILITY: 'Pasivo (Deuda / Crédito)',
  ACTIVE_COMMITMENT: 'Compromiso Activo',

  // Propiedad y Tenencia
  OWNED: 'Propio(a)',
  RENTED: 'Rentado(a)',
  FAMILY: 'Familiar',
  BORROWED: 'Prestada',
  PAID: 'Pagada',
  MORTGAGE: 'Hipotecada',
  MORTGAGED: 'Hipotecado(a)',
  FINANCED: 'Financiado(a)',
  LOAN: 'Préstamo',
  INFONAVIT: 'INFONAVIT',
  NOT_APPLICABLE: 'No Aplica',

  // Vehículos
  CAR: 'Automóvil',
  AUTOMOBILE: 'Automóvil',
  MOTORCYCLE: 'Motocicleta',
  TRUCK: 'Camioneta / Camión',
  VAN: 'Furgoneta',

  // Parentescos
  SPOUSE: 'Cónyuge',
  CHILD: 'Hijo(a)',
  PARENT: 'Padre / Madre',

  // Tipos de Evidencia y Archivos
  EVIDENCE: 'Evidencia de Visita',
  IDENTIFICATION: 'Identificación Oficial',
  ADDRESS_PROOF: 'Comprobante de Domicilio',
  VEHICLE_EVIDENCE: 'Evidencia de Vehículo',
  ASSET_EVIDENCE: 'Evidencia de Patrimonio',
  COMMERCIAL_EVIDENCE: 'Evidencia de Crédito Comercial',
  REFUND_EVIDENCE: 'Evidencia de Devolución',
  PHOTO: 'Fotografía',
  DOCUMENT: 'Documento Digital',
  FRONT_PHOTO: 'Foto de Fachada / Frente',
  INSIDE_PHOTO: 'Foto Interior',
  NEIGHBORHOOD_PHOTO: 'Foto de Entorno / Calle',
  IDENTIFICATION_PHOTO: 'Foto de Identificación',
  SIBLING: 'Hermano(a)',
  OTHER: 'Otro(a)',

  // Nacionalidad e Identificaciones
  MEXICAN: 'Mexicana',
  FOREIGN: 'Extranjera',
  INE: 'Credencial para Votar (INE)',
  PASSPORT: 'Pasaporte',
  PROFESSIONAL_LICENSE: 'Cédula Profesional',

  // Estado civil y género
  SINGLE: 'Soltero(a)',
  MARRIED: 'Casado(a)',
  DIVORCED: 'Divorciado(a)',
  WIDOWED: 'Viudo(a)',
  FREE_UNION: 'Unión Libre',
  MALE: 'Masculino',
  FEMALE: 'Femenino',

  // Verificación
  ASSIGNED: 'Asignada',
  IN_PROGRESS: 'En Curso',
  COMPLETED: 'Completada',
  FAVORABLE: 'Favorable',
  UNFAVORABLE: 'Desfavorable',
  SUCCESS: 'Exitoso',
  FAILURE: 'Fallido',
  DENIED: 'Denegado',
};

@Injectable({
  providedIn: 'root',
})
export class AuditoriaApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getAudits(filters: AuditFilters): Observable<AuditPagination> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((val) => {
            params = params.append(`${key}[]`, String(val));
          });
        } else {
          params = params.set(key, String(value));
        }
      }
    });

    return this.http.get<AuditPagination>(`${this.config.baseUrl}/audit-logs`, { params });
  }

  getFilterOptions(): Observable<AuditFilterOptions> {
    return this.http
      .get<{ data: AuditFilterOptions } | AuditFilterOptions>(`${this.config.baseUrl}/audit-logs/options`)
      .pipe(
        map((res: any) => {
          if (res && res.data && typeof res.data === "object" && "events" in res.data) {
            return res.data as AuditFilterOptions;
          }
          return res as AuditFilterOptions;
        }),
      );
  }

  getOperationalLogs(filters: OperationalLogFilters): Observable<OperationalLogPagination> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<OperationalLogPagination>(
      `${this.config.baseUrl}/operational-logs`,
      { params },
    );
  }

  getActionGroup(eventName: string): AuditActionGroup {
    if (
      eventName.startsWith('LOGIN') ||
      eventName.startsWith('LOGOUT') ||
      eventName.includes('PASSWORD') ||
      eventName.includes('MFA') ||
      eventName.includes('WEBAUTHN') ||
      eventName.includes('INVITATION') ||
      eventName.includes('SESSION')
    ) {
      return 'AUTH';
    }
    if (
      eventName.startsWith('DISTRIBUTOR_APPLICATION') ||
      eventName.startsWith('VERIFICATION') ||
      eventName.startsWith('APPLICATION')
    ) {
      return 'SOLICITUDES';
    }
    if (eventName.startsWith('DISTRIBUTOR_')) {
      return 'DISTRIBUIDORAS';
    }
    if (eventName.startsWith('VOUCHER_')) {
      return 'VALES';
    }
    if (eventName.startsWith('CLIENT_')) {
      return 'CLIENTES';
    }
    if (
      eventName.startsWith('PAYMENT_') ||
      eventName.startsWith('EXCESS_') ||
      eventName.startsWith('REFUND_') ||
      eventName.startsWith('BANK_')
    ) {
      return 'PAGOS';
    }
    if (
      eventName.startsWith('CREDIT_') ||
      eventName.startsWith('EV-READ-') ||
      eventName === 'CUTOFF_EXECUTED'
    ) {
      return 'CREDITOS';
    }
    if (eventName.includes('MEDIA') || eventName.includes('FILE')) {
      return 'DOCUMENTOS';
    }
    if (eventName.includes('ROLE') || eventName.includes('PERMISSION')) {
      return 'CONFIGURACION';
    }
    return 'SISTEMA';
  }

  getRoleLabel(role: string | null | undefined): string {
    if (!role) return 'Sistema / Sin rol';
    return ROLE_LABELS_ES[role] || role;
  }

  getEntityLabel(entity: string): string {
    return ENTITY_LABELS_ES[entity] || this.humanize(entity);
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
    const cleaned = (eventName || 'EVENT')
      .replace(/^EV-/, '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      label: cleaned,
      category: 'General',
      icon: 'activity',
      badgeColor: 'badge-gray',
    };
  }

  getFieldLabel(field: string): string {
    return FIELD_LABELS_ES[field] || this.humanize(field);
  }

  formatValue(value: unknown, fieldName?: string): string {
    if (value === null || value === undefined) return '(vacío)';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'number') {
      if (
        fieldName &&
        /amount|balance|limit|income|price|payment|line_amount|value/i.test(fieldName)
      ) {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
          value,
        );
      }
      if (fieldName && /size_bytes|file_size/i.test(fieldName)) {
        if (value >= 1048576) return (value / 1048576).toFixed(2) + ' MB';
        if (value >= 1024) return (value / 1024).toFixed(1) + ' KB';
        return value + ' B';
      }
      return String(value);
    }
    if (typeof value === 'string') {
      if (value === '') return '(vacío)';
      if (VALUE_LABELS_ES[value]) return VALUE_LABELS_ES[value];
      if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            ...(value.includes('T') ? { hour: '2-digit', minute: '2-digit' } : {}),
          });
        }
      }
      if (
        fieldName &&
        /amount|balance|limit|income|price|payment|line_amount|value/i.test(fieldName) &&
        !isNaN(Number(value))
      ) {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
          Number(value),
        );
      }
      if (value.length > 90) return value.substring(0, 87) + '...';
      return value;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return '(lista vacía)';
      return value.map((item) => this.formatValue(item, fieldName)).join(', ');
    }
    if (typeof value === 'object') {
      const keys = Object.keys(value as Record<string, unknown>);
      if (keys.length === 0) return '(vacío)';
      return keys
        .map(
          (k) =>
            `${this.getFieldLabel(k)}: ${this.formatValue((value as Record<string, unknown>)[k], k)}`,
        )
        .join(' · ');
    }
    return String(value);
  }

  getEntityFolioOrIdentifier(audit: AuditRecord): { folio: string; isRealFolio: boolean } {
    const next = audit.new_value ?? {};
    const prev = audit.previous_value ?? {};
    const evidence = audit.evidence ?? {};

    const fileName = next['file_name'] || prev['file_name'] || next['original_name'] || prev['original_name'];
    if (fileName) return { folio: String(fileName), isRealFolio: true };

    const appNumber =
      next['application_number'] || prev['application_number'] || evidence['application_number'];
    if (appNumber) return { folio: String(appNumber), isRealFolio: true };

    const folio = next['folio'] || prev['folio'] || next['voucher_folio'] || prev['voucher_folio'];
    if (folio) return { folio: String(folio), isRealFolio: true };

    const distNumber = next['distributor_number'] || prev['distributor_number'];
    if (distNumber) return { folio: `Dist. #${distNumber}`, isRealFolio: true };

    const clientNumber = next['client_number'] || prev['client_number'];
    if (clientNumber) return { folio: `Cli. #${clientNumber}`, isRealFolio: true };

    if (audit.entity_id) {
      const id = String(audit.entity_id);
      return {
        folio: id.length > 18 ? `${id.substring(0, 8)}...${id.substring(id.length - 4)}` : id,
        isRealFolio: false,
      };
    }

    return { folio: 'Sistema', isRealFolio: false };
  }

  extractActualChanges(audit: AuditRecord): ChangedFieldDetail[] {
    let prevRaw: Record<string, unknown> = {};
    let nextRaw: Record<string, unknown> = {};

    // 1. Extraer payload anterior
    if (audit.previous_value && typeof audit.previous_value === 'object') {
      prevRaw = { ...audit.previous_value };
    } else if (
      audit.new_value &&
      typeof audit.new_value === 'object' &&
      audit.new_value['previous_values'] &&
      typeof audit.new_value['previous_values'] === 'object' &&
      !Array.isArray(audit.new_value['previous_values'])
    ) {
      prevRaw = { ...(audit.new_value['previous_values'] as Record<string, unknown>) };
    }

    // 2. Extraer payload nuevo
    if (
      audit.new_value &&
      typeof audit.new_value === 'object' &&
      audit.new_value['new_values'] &&
      typeof audit.new_value['new_values'] === 'object' &&
      !Array.isArray(audit.new_value['new_values'])
    ) {
      nextRaw = { ...(audit.new_value['new_values'] as Record<string, unknown>) };
    } else if (audit.new_value && typeof audit.new_value === 'object') {
      nextRaw = { ...audit.new_value };
    }

    // 3. Claves técnicas envolventes a omitir del cuadro de cambios de negocio
    const envelopeKeys = new Set([
      'id',
      'actor_role',
      'application_id',
      'application_number',
      'action',
      'device',
      'security_event_id',
      'reason',
      'result',
      'created_at',
      'updated_at',
      'deleted_at',
      'password',
      'previous_values',
      'new_values',
      'metadata',
      'evidence',
      'user_id',
      'branch_id',
      'record_id',
      'residence_id',
      'client_id',
      'distributor_id',
      'vehicle_id',
      'family_member_id',
      'employment_id',
      'asset_liability_id',
      'lock_version',
      'application_lock_version',
      'fields_updated',
    ]);

    const hasVerifierName = Boolean(nextRaw['verifier_name'] || prevRaw['verifier_name']);
    const allKeys = new Set([
      ...Object.keys(prevRaw).filter((k) => !envelopeKeys.has(k) && (!hasVerifierName || k !== 'verifier_id')),
      ...Object.keys(nextRaw).filter((k) => !envelopeKeys.has(k) && (!hasVerifierName || k !== 'verifier_id')),
    ]);

    const changes: ChangedFieldDetail[] = [];

    allKeys.forEach((key) => {
      const oldVal = prevRaw[key];
      const newVal = nextRaw[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          label: this.getFieldLabel(key),
          oldValue: this.formatValue(oldVal, key),
          rawOld: oldVal,
          newValue: this.formatValue(newVal, key),
          rawNew: newVal,
          isCreation: oldVal === undefined || oldVal === null,
          isDeletion: newVal === undefined || newVal === null,
        });
      }
    });

    return changes;
  }

  getChangedFields(audit: AuditRecord): ChangedFieldDetail[] {
    return this.extractActualChanges(audit);
  }

  describeAction(audit: AuditRecord): string {
    const event = audit.event_name || '';
    const actorName =
      audit.actor?.name ?? (audit.actor_role ? this.getRoleLabel(audit.actor_role) : 'Un usuario');
    const entityLabel = this.getEntityLabel(audit.entity_type || '').toLowerCase();
    const newVal = audit.new_value ?? {};
    const prevVal = audit.previous_value ?? {};
    const folioInfo = this.getEntityFolioOrIdentifier(audit);
    const folioText = folioInfo.isRealFolio ? ` ${folioInfo.folio}` : '';

    // --- Solicitudes de Distribuidora ---
    if (event === 'DISTRIBUTOR_APPLICATION_SUBMITTED') {
      return `${actorName} envió la solicitud${folioText} a revisión de coordinación.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_CREATED') {
      return `${actorName} dio de alta la solicitud${folioText} en borrador.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_PERSONAL_DATA_UPDATED') {
      return `${actorName} actualizó los datos personales de la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_RESIDENCE_ADDED') {
      return `${actorName} agregó un domicilio a la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_RESIDENCE_UPDATED') {
      return `${actorName} actualizó los datos de domicilio de la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_RESIDENCE_REMOVED') {
      return `${actorName} eliminó un domicilio de la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_COMMERCIAL_CREDIT_ADDED') {
      return `${actorName} agregó un crédito comercial a la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_COMMERCIAL_CREDIT_UPDATED') {
      return `${actorName} actualizó un crédito comercial de la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_COMMERCIAL_CREDIT_REMOVED') {
      return `${actorName} eliminó un crédito comercial de la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_VEHICLE_ADDED') {
      return `${actorName} agregó un vehículo a la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_VEHICLE_UPDATED') {
      return `${actorName} actualizó los datos de vehículo de la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_VEHICLE_REMOVED') {
      return `${actorName} eliminó un vehículo de la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_EMPLOYMENT_ADDED') {
      return `${actorName} agregó un empleo / actividad económica a la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_EMPLOYMENT_UPDATED') {
      return `${actorName} actualizó la actividad económica de la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_EMPLOYMENT_REMOVED') {
      return `${actorName} eliminó un empleo de la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_FAMILY_MEMBER_ADDED') {
      return `${actorName} registró un familiar en la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_FAMILY_MEMBER_UPDATED') {
      return `${actorName} actualizó datos de un familiar en la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_FAMILY_MEMBER_REMOVED') {
      return `${actorName} eliminó un familiar de la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_ASSET_LIABILITY_ADDED') {
      return `${actorName} registró patrimonio / bienes en la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_ASSET_LIABILITY_UPDATED') {
      return `${actorName} actualizó datos de patrimonio en la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_ASSET_LIABILITY_REMOVED') {
      return `${actorName} eliminó un registro de patrimonio en la solicitud${folioText}.`;
    }
    if (event === 'DISTRIBUTOR_APPLICATION_RETURNED_TO_DRAFT') {
      const reason = audit.reason ? `: "${audit.reason}"` : '';
      return `${actorName} devolvió la solicitud${folioText} a captura para corrección${reason}.`;
    }

    // --- Verificación ---
    if (event === 'VERIFICATION_VISIT_ASSIGNED') {
      return `${actorName} asignó un verificador y programó visita para la solicitud${folioText}.`;
    }
    if (event === 'VERIFICATION_VISIT_RESCHEDULED') {
      return `${actorName} reprogramó el horario o verificador de la visita para la solicitud${folioText}.`;
    }
    if (event === 'VERIFICATION_VISIT_STARTED') {
      return `${actorName} inició la visita de verificación en campo para la solicitud${folioText}.`;
    }
    if (event === 'VERIFICATION_DIFFERENCE_RECORDED') {
      return `${actorName} registró diferencias encontradas en la visita de la solicitud${folioText}.`;
    }
    if (event === 'VERIFICATION_VISIT_COMPLETED') {
      const result = newVal['result']
        ? ` con resultado ${this.formatValue(newVal['result'])}`
        : '';
      return `${actorName} finalizó la visita de verificación${result} para la solicitud${folioText}.`;
    }
    if (event === 'VERIFICATION_EVIDENCE_UPLOADED') {
      return `${actorName} subió fotografía de evidencia para la verificación${folioText}.`;
    }
    if (event === 'VERIFICATION_EVIDENCE_REMOVED') {
      return `${actorName} eliminó una fotografía de evidencia de la verificación${folioText}.`;
    }
    if (event === 'APPLICATION_CORRECTION_APPLIED') {
      const field = newVal['field']
        ? ` en el campo "${this.getFieldLabel(String(newVal['field']))}"`
        : '';
      return `${actorName} aplicó una corrección de diferencia${field} en la solicitud${folioText}.`;
    }
    if (event === 'APPLICATION_CORRECTIONS_COMPLETED') {
      return `${actorName} finalizó la etapa de correcciones de diferencias de la solicitud${folioText}.`;
    }
    if (event === 'APPLICATION_COORDINATOR_EVALUATED') {
      const res = newVal['result'] ? ` como ${this.formatValue(newVal['result'])}` : '';
      return `${actorName} evaluó la solicitud${folioText}${res}.`;
    }
    if (event === 'APPLICATION_SENT_TO_MANAGER') {
      return `${actorName} envió la solicitud${folioText} a dictamen de gerencia.`;
    }
    if (event === 'APPLICATION_TERMINATED_UNFAVORABLE') {
      return `${actorName} finalizó la solicitud${folioText} con dictamen desfavorable.`;
    }
    if (event === 'APPLICATION_MANAGER_APPROVED') {
      const line = newVal['initial_credit_line_amount']
        ? ` con línea de crédito de $${newVal['initial_credit_line_amount']}`
        : '';
      return `${actorName} aprobó la solicitud de distribuidora${folioText}${line}.`;
    }
    if (event === 'APPLICATION_MANAGER_REJECTED') {
      const reason = audit.reason ? `: "${audit.reason}"` : '';
      return `${actorName} rechazó la solicitud de distribuidora${folioText}${reason}.`;
    }

    // --- Consultas y Lecturas ---
    if (event === 'EV-READ-LINE') {
      return `${actorName} consultó el estado y saldo de la línea de crédito.`;
    }
    if (event === 'EV-READ-MOVEMENTS') {
      return `${actorName} consultó el historial de movimientos de la línea de crédito.`;
    }
    if (event === 'PRIVATE_MEDIA_DOWNLOADED') {
      return `${actorName} descargó un archivo de expediente.`;
    }
    if (event === 'PRIVATE_MEDIA_STORED' || event === 'MEDIA_UPLOADED') {
      return `${actorName} cargó un documento digitalizado.`;
    }

    // --- Vales ---
    if (event === 'VOUCHER_GENERATED') {
      const folio = (newVal['folio'] as string) || (newVal['voucher_folio'] as string) || '';
      const amount = newVal['amount'] || newVal['total_amount'] || '';
      return `${actorName} generó el vale ${folio}${amount ? ' por $' + amount : ''}.`;
    }
    if (event === 'VOUCHER_CANCELLED' || event === 'VOUCHER_CANCELLED_BY_DISTRIBUTOR') {
      const folio = (newVal['folio'] as string) || (prevVal['folio'] as string) || '';
      return `${actorName} canceló el vale ${folio}.`;
    }
    if (event === 'VOUCHER_RELEASED') {
      const folio = (newVal['folio'] as string) || '';
      return `${actorName} liberó el vale ${folio}.`;
    }
    if (event === 'VOUCHER_CASHED') {
      const folio = (newVal['folio'] as string) || '';
      return `${actorName} cobró en caja el vale ${folio}.`;
    }

    // --- Clientes ---
    if (event === 'CLIENT_CREATED') {
      const clientName = newVal['name'] || newVal['first_name'] || '';
      return `${actorName} dio de alta al cliente ${clientName ? '"' + clientName + '"' : ''}.`;
    }
    if (event === 'CLIENT_UPDATED') {
      const changes = this.extractActualChanges(audit);
      if (changes.length > 0) {
        const fields = changes
          .slice(0, 3)
          .map((c) => c.label.toLowerCase())
          .join(', ');
        return `${actorName} editó ${fields} del cliente.`;
      }
      return `${actorName} actualizó los datos del cliente.`;
    }
    if (event === 'CLIENT_DELETED') {
      return `${actorName} eliminó al cliente.`;
    }

    // --- Pagos y Créditos ---
    if (event === 'PAYMENT_APPLIED') {
      const amount = newVal['amount'] || newVal['payment_amount'] || '';
      return `${actorName} aplicó un pago${amount ? ' por $' + amount : ''}.`;
    }
    if (event === 'CREDIT_LINE_ADJUSTED') {
      const amount = newVal['credit_limit'] || newVal['amount'] || '';
      return `${actorName} ajustó la línea de crédito${amount ? ' a $' + amount : ''}.`;
    }
    if (event === 'CUTOFF_EXECUTED') {
      return `${actorName} ejecutó el corte quincenal de relaciones.`;
    }

    // --- Accesos ---
    if (event === 'LOGIN_SUCCESSFUL') return `${actorName} inició sesión en el sistema.`;
    if (event === 'LOGIN_FAILED') return `Intento fallido de inicio de sesión.`;
    if (event === 'LOGOUT') return `${actorName} cerró su sesión de usuario.`;

    // Fallback genérico por cambios detectados
    const changes = this.extractActualChanges(audit);
    if (changes.length > 0) {
      const fieldList = changes
        .slice(0, 3)
        .map((c) => c.label.toLowerCase())
        .join(', ');
      const suffix = changes.length > 3 ? ` y ${changes.length - 3} campo(s) más` : '';
      return `${actorName} modificó ${fieldList}${suffix} en ${entityLabel || 'el sistema'}.`;
    }

    const eventInfo = this.getEventInfo(event);
    return `${actorName} realizó: ${eventInfo.label}.`;
  }

  private humanize(text: string): string {
    return text
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}



