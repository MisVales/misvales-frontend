import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import {
  FullScreenCalendarComponent,
  type FullScreenCalendarEvent,
} from '../../../../shared/components/calendar/full-screen-calendar.component';
import type { VisitaVerificacion } from '../../models/verificacion-distribuidoras.models';
import { canStartScheduledVisit } from '../../utils/visit-schedule-policy';

@Component({
  selector: 'app-visitas-asignadas',
  standalone: true,
  imports: [DatePipe, StatusLabelPipe, FullScreenCalendarComponent],
  templateUrl: './visitas-asignadas.component.html',
  styleUrl: './visitas-asignadas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitasAsignadasComponent implements OnInit {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly view = this.route.snapshot.data['visitView'] as 'calendar' | undefined;
  protected readonly historyPage = signal(1);
  protected readonly historyPageSize = 10;
  protected readonly visits = computed(() => {
    const visits = this.facade.visitasAsignadas();
    if (this.view === 'calendar') {
      return [...visits]
        .filter((visit) => visit.estado !== 'COMPLETED')
        .sort((left, right) => timestamp(left.fechaProgramada) - timestamp(right.fechaProgramada));
    }
    return visits;
  });
  protected readonly upcomingVisits = computed(() =>
    [...this.facade.visitasAsignadas()]
      .filter((visit) => visit.estado !== 'COMPLETED')
      .sort((left, right) => timestamp(left.fechaProgramada) - timestamp(right.fechaProgramada)),
  );
  protected readonly visitDays = computed(() => {
    const groups = new Map<string, VisitaVerificacion[]>();
    for (const visit of this.upcomingVisits()) {
      const key = visit.fechaProgramada?.slice(0, 10) ?? 'sin-fecha';
      groups.set(key, [...(groups.get(key) ?? []), visit]);
    }
    return [...groups.entries()].map(([key, visits]) => ({
      key,
      label: key === 'sin-fecha'
        ? 'Sin fecha programada'
        : new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' }).format(new Date(`${key}T12:00:00`)),
      fullLabel: key === 'sin-fecha'
        ? 'Visitas sin fecha programada'
        : new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${key}T12:00:00`)),
      visits,
    }));
  });
  protected readonly historyVisits = computed(() =>
    [...this.facade.visitasAsignadas()]
      .filter((visit) => visit.estado === 'COMPLETED')
      .sort((left, right) => timestamp(right.fechaFin) - timestamp(left.fechaFin)),
  );
  protected readonly historyTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.historyVisits().length / this.historyPageSize)),
  );
  protected readonly pagedHistory = computed(() => {
    const start = (this.historyPage() - 1) * this.historyPageSize;
    return this.historyVisits().slice(start, start + this.historyPageSize);
  });
  protected readonly calendarEvents = computed<readonly FullScreenCalendarEvent[]>(() =>
    this.visits()
      .filter((visit): visit is VisitaVerificacion & { fechaProgramada: string } =>
        Boolean(visit.fechaProgramada),
      )
      .map((visit) => ({
        id: visit.id,
        datetime: visit.fechaProgramada,
        title: visit.solicitudNombre || 'Solicitud asignada',
        subtitle: `${visit.evidencias.length} evidencias · ${visit.diferencias.length} diferencias`,
        time: new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit' }).format(
          new Date(visit.fechaProgramada),
        ),
        status: this.etiquetaEstado(visit.estado),
        tone:
          visit.estado === 'IN_PROGRESS'
            ? 'orange'
            : visit.estado === 'COMPLETED'
              ? 'green'
              : 'blue',
      })),
  );

  ngOnInit() {
    this.facade.cargarVisitasAsignadas(1, 100);
  }

  onHistoryPageChange(page: number) {
    this.historyPage.set(Math.min(Math.max(1, page), this.historyTotalPages()));
  }

  async abrirVisita(visita: {
    id: string;
    estado: string;
    lockVersion: number;
    fechaProgramada: string | null;
  }): Promise<void> {
    if (visita.estado === 'ASSIGNED' && !this.puedeIniciar(visita.fechaProgramada)) {
      return;
    }
    if (
      visita.estado === 'ASSIGNED' &&
      !(await this.facade.iniciarVisita(visita.id, { lock_version: visita.lockVersion }))
    ) {
      return;
    }

    await this.router.navigate([
      '/verificacion-distribuidoras/verificaciones',
      visita.id,
      'visita',
    ]);
  }

  puedeIniciar(fechaProgramada: string | null): boolean {
    return canStartScheduledVisit(fechaProgramada);
  }

  identificadorSolicitud(nombre: string): string {
    const normalizado = nombre.trim().replace(/\s+/g, '');
    return normalizado ? `Solicitud-${normalizado}` : 'Solicitud';
  }

  protected abrirEventoCalendario(event: FullScreenCalendarEvent): void {
    const visit = this.visits().find((item) => item.id === event.id);
    if (visit) void this.abrirVisita(visit);
  }

  private etiquetaEstado(estado: string): string {
    if (estado === 'IN_PROGRESS') return 'En progreso';
    if (estado === 'COMPLETED') return 'Terminada';
    return 'Asignada';
  }
}

function timestamp(value: string | null): number {
  return value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER;
}
