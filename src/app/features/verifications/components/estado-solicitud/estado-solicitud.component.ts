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
      'PHYSICAL_VERIFICATION': 'Verificación Física',
      'COORDINATOR_CORRECTION': 'Corrección Coord.',
      'COORDINATOR_EVALUATION': 'Evaluación Coord.',
      'MANAGER_AUTHORIZATION': 'Autorización Gerencial',
      'AUTHORIZED_PENDING_ACTIVATION': 'Autorizado (P. Act.)',
      'TERMINATED_UNFAVORABLE': 'Terminada Desfavorable',
      'REJECTED': 'Rechazado',
      'ACTIVE': 'Activa'
    };
    return map[this.estado()] || this.estado();
  });
  
  estadoClass = computed(() => {
    switch (this.estado()) {
      case 'DRAFT': return 'badge-neutral';
      case 'COORDINATOR_REVIEW': 
      case 'VERIFIER_ASSIGNED':
      case 'PHYSICAL_VERIFICATION': return 'badge-info';
      case 'COORDINATOR_CORRECTION':
      case 'COORDINATOR_EVALUATION': 
      case 'MANAGER_AUTHORIZATION': return 'badge-warning';
      case 'AUTHORIZED_PENDING_ACTIVATION':
      case 'ACTIVE': return 'badge-success';
      case 'TERMINATED_UNFAVORABLE':
      case 'REJECTED': 
        return 'badge-danger';
      default: return 'badge-neutral';
    }
  });
}
