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
      DRAFT: 'Borrador',
      COORDINATOR_REVIEW: 'Revisión Coord.',
      VERIFIER_ASSIGNED: 'Visita Asignada',
      PHYSICAL_VERIFICATION: 'Visita en progreso',
      COORDINATOR_EVALUATION: 'Evaluación Coord.',
      MANAGER_AUTHORIZATION: 'Autorización Gerencial',
      AUTORIZADA: 'Autorizada',
      RECHAZADA: 'Rechazada',
      COORDINATOR_CORRECTION: 'Corrección del coordinador',
      TERMINATED_UNFAVORABLE: 'Terminada desfavorable',
    };
    return map[this.estado()] || this.estado();
  });

  estadoClass = computed(() => {
    switch (this.estado()) {
      case 'DRAFT':
        return 'badge-neutral';
      case 'COORDINATOR_REVIEW':
      case 'VERIFIER_ASSIGNED':
      case 'PHYSICAL_VERIFICATION':
        return 'badge-info';
      case 'COORDINATOR_EVALUATION':
      case 'MANAGER_AUTHORIZATION':
        return 'badge-warning';
      case 'AUTORIZADA':
        return 'badge-success';
      case 'RECHAZADA':
      case 'TERMINATED_UNFAVORABLE':
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  });
}
