const EVENT_LABELS: Readonly<Record<string, string>> = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGIN_FAILED: 'Inicio de sesión rechazado',
  PASSWORD_CHANGE: 'Contraseña actualizada',
  MFA_RECONFIGURED: 'Método de seguridad actualizado',
  RECOVERY_CODES_REGENERATED: 'Códigos de recuperación renovados',
  SESSION_REVOKED: 'Sesión cerrada',
  ROLE_ASSIGNED: 'Rol asignado',
};

const OUTCOME_LABELS: Readonly<Record<string, string>> = {
  SUCCESS: 'Operación completada',
  FAILURE: 'Operación rechazada',
  FAILED: 'Operación rechazada',
  DENIED: 'Acceso denegado',
  ALLOWED: 'Acceso permitido',
};

export function securityEventLabel(value: string): string {
  return EVENT_LABELS[value.trim().toUpperCase()] ?? 'Evento de seguridad';
}

export function securityOutcomeLabel(value: string): string {
  return OUTCOME_LABELS[value.trim().toUpperCase()] ?? 'Resultado registrado';
}
