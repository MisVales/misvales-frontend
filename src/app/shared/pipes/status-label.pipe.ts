import { Pipe, PipeTransform } from '@angular/core';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Vigente',
  INACTIVE: 'Inactivo',
  REVOKED: 'Retirada',
  ENDED: 'Finalizada',
  REASSIGNED: 'Reasignada',
  PUBLISHED: 'Publicada',
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  PENDING_ACTIVATION: 'Activación pendiente',
  AUTHORIZED_PENDING_ACTIVATION: 'Autorizada pendiente de activación',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  COMPLETED: 'Completada',
  NOT_APPLICABLE: 'No aplica',
  ASSIGNED: 'Asignada',
  IN_PROGRESS: 'En progreso',
  PARTIALLY_PAID: 'Abono',
  OVERDUE: 'Vencida',
  ROLLED_FORWARD: 'Vencida',
  PAID: 'Pagada',
  SETTLED: 'Liquidada',
  NO_RECORDS: 'Sin movimientos',
  CASHED: 'Cobrada',
  CANCELLED: 'Cancelada',
  VOIDED: 'Anulada',
  BLOCKED: 'Bloqueada',
  DISABLED: 'Deshabilitada',
  INVITED: 'Invitada',
  PREPARED: 'Preparada',
  CONSUMED: 'Consumida',
  EXPIRED: 'Vencida',
  REQUESTED: 'Pendiente de coordinación',
  PREAUTHORIZED: 'Pendiente de gerencia',
  AUTHORIZED_TOTAL: 'Autorizada',
  AUTHORIZED_PARTIAL: 'Autorizada parcialmente',
  REJECTED_BY_COORDINATOR: 'Rechazada por coordinación',
  REJECTED_BY_MANAGER: 'Rechazada por gerencia',
};

@Pipe({
  name: 'statusLabel',
  standalone: true,
})
export class StatusLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return 'Sin estado';

    return STATUS_LABELS[value.trim().toUpperCase()] ?? 'Estado no disponible';
  }
}
