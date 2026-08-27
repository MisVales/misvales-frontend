import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SolicitudDistribuidora } from '../../models/verificacion-distribuidoras.models';
import { DatePipe } from '@angular/common';

interface TimelineEvent {
  title: string;
  date: string | null;
  status: 'DONE' | 'CURRENT' | 'PENDING';
  description?: string;
}

@Component({
  selector: 'app-linea-tiempo-solicitud',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './linea-tiempo-solicitud.component.html',
  styleUrl: './linea-tiempo-solicitud.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineaTiempoSolicitudComponent {
  solicitud = input<SolicitudDistribuidora | null>(null);

  eventos = computed<TimelineEvent[]>(() => {
    const s = this.solicitud();
    if (!s) return [];
    const events: TimelineEvent[] = [];

    // 1. Envío
    events.push({
      title: 'Solicitud Enviada',
      date: s.fechaEnvio,
      status: s.fechaEnvio ? 'DONE' : 'PENDING'
    });

    // 2. Revisión / Asignación
    const hasVisits = s.visitas.length > 0;
    const isAssigned = hasVisits && s.visitas[0].verificadorId != null;
    events.push({
      title: 'Verificador Asignado',
      date: isAssigned ? s.visitas[0].fechaAsignacion : null,
      status: isAssigned ? 'DONE' : (s.estado === 'COORDINATOR_REVIEW' ? 'CURRENT' : 'PENDING'),
      description: isAssigned ? 'Asignado para visita física' : 'Pendiente de asignación por el coordinador'
    });

    // 3. Visita Física
    const visitCompleted = hasVisits && s.visitas[0].estado === 'COMPLETED';
    events.push({
      title: 'Visita Física Completada',
      date: visitCompleted ? s.visitas[0].fechaFin : null,
      status: visitCompleted ? 'DONE' : (s.estado === 'VERIFIER_ASSIGNED' || s.estado === 'PHYSICAL_VERIFICATION' ? 'CURRENT' : 'PENDING'),
      description: visitCompleted ? `Resultado: ${s.visitas[0].resultadoFisico}` : ''
    });

    // 4. Evaluación del Coordinador
    const hasEval = s.ultimaEvaluacion != null;
    events.push({
      title: 'Evaluación del Coordinador',
      date: hasEval ? s.ultimaEvaluacion!.fechaEvaluacion : null,
      status: hasEval ? 'DONE' : (s.estado === 'COORDINATOR_EVALUATION' ? 'CURRENT' : 'PENDING'),
      description: hasEval ? `Dictamen: ${s.ultimaEvaluacion!.dictamen === 'COMPLIES' ? 'Cumple' : 'No Cumple'}` : ''
    });

    // 5. Autorización Gerencial
    const hasAuth = s.autorizacion != null;
    events.push({
      title: 'Decisión Gerencial',
      date: hasAuth ? s.autorizacion!.fechaAutorizacion : null,
      status: hasAuth ? 'DONE' : (s.estado === 'MANAGER_AUTHORIZATION' ? 'CURRENT' : 'PENDING'),
      description: hasAuth ? `Decisión: ${s.autorizacion!.decision === 'APPROVED' ? 'Aprobado' : 'Rechazado'}` : ''
    });

    return events;
  });
}
