import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { EstadoSolicitudDistribuidora } from '../../models/verificacion-distribuidoras.models';

@Component({
  selector: 'app-estado-solicitud',
  standalone: true,
  templateUrl: './estado-solicitud.component.html',
  styleUrl: './estado-solicitud.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoSolicitudComponent {
  estado = input.required<EstadoSolicitudDistribuidora>();
  
  estadoLabel = computed(() => {
    const map: Record<EstadoSolicitudDistribuidora, string> = {
      'DRAFT': 'Borrador',
      'COORDINATOR_REVIEW': 'Revisión Coord.',
      'VERIFIER_ASSIGNED': 'Visita Asignada',
      'VERIFICATION_IN_PROGRESS': 'Visita en Progreso',
      'COORDINATOR_EVALUATION': 'Evaluación Coord.',
      'MANAGER_AUTHORIZATION': 'Autorización Gerencial',
      'AUTHORIZED_PENDING_ACTIVATION': 'Autorizado (P. Act.)',
      'REJECTED': 'Rechazado',
      'CANCELLED': 'Cancelado'
    };
    return map[this.estado()] || this.estado();
  });
  
  estadoClass = computed(() => {
    switch (this.estado()) {
      case 'DRAFT': return 'badge-neutral';
      case 'COORDINATOR_REVIEW': 
      case 'VERIFIER_ASSIGNED':
      case 'VERIFICATION_IN_PROGRESS': return 'badge-info';
      case 'COORDINATOR_EVALUATION': 
      case 'MANAGER_AUTHORIZATION': return 'badge-warning';
      case 'AUTHORIZED_PENDING_ACTIVATION': return 'badge-success';
      case 'REJECTED': 
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-neutral';
    }
  });
}
