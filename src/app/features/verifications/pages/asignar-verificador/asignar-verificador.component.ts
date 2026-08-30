import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';
import { firstValueFrom } from 'rxjs';
import { VerificacionDistribuidorasApiService } from '../../data-access/api/verificacion-distribuidoras-api.service';
import type { AgendaVerificadorDto } from '../../data-access/dtos/verificacion-distribuidoras.dtos';
import { nextAssignableSlot } from '../../utils/visit-schedule-policy';

@Component({
  selector: 'app-asignar-verificador',
  standalone: true,
  imports: [FormsModule, RefactorSelectComponent],
  templateUrl: './asignar-verificador.component.html',
  styleUrl: './asignar-verificador.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignarVerificadorComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(VerificacionDistribuidorasFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertService);
  private readonly api = inject(VerificacionDistribuidorasApiService);

  verifierId = '';
  selectedDate = localDateKey(new Date());
  selectedTime = '';
  submitted = false;
  private readonly currentTime = signal(new Date());
  private readonly clockTimer = window.setInterval(() => this.currentTime.set(new Date()), 30_000);
  protected readonly scheduleLoading = signal(false);
  protected readonly schedule = signal<AgendaVerificadorDto[]>([]);
  protected readonly visibleMonth = signal(startOfMonth(new Date()));
  protected readonly schedulePolicy = signal({
    start_time: '08:00',
    max_start_time: '23:45',
    timezone: 'America/Monterrey',
    slot_minutes: 15,
  });
  protected readonly calendarDays = computed(() => calendarGrid(this.visibleMonth()));
  protected readonly monthLabel = computed(() =>
    this.visibleMonth().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
  );
  readonly isReassign = computed(() =>
    Boolean(this.facade.solicitudSeleccionada()?.visitas.some((v) => v.estado === 'ASSIGNED')),
  );

  rawTimeInput = '';

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await Promise.all([
        this.facade.cargarSolicitud(id),
        this.facade.cargarVerificadoresDisponibles(id),
        this.loadSchedulePolicy(),
      ]);

      const solicitud = this.facade.solicitudSeleccionada();
      const visit = solicitud?.visitas.find((v) => v.estado === 'ASSIGNED');
      if (visit && visit.fechaProgramada) {
        const visitDate = new Date(visit.fechaProgramada);
        this.selectedDate = localDateKey(visitDate);
        this.selectedTime = localTimeKey(visitDate);
        this.rawTimeInput = this.selectedTime;
        this.verifierId = visit.verificadorId || '';
        if (this.verifierId) {
          await this.loadSchedule();
        }
      }
    }
  }

  ngOnDestroy() {
    window.clearInterval(this.clockTimer);
    this.facade.limpiarSeleccion();
  }

  is15MinuteInterval(time: string): boolean {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return false;
    const [, minutes] = time.split(':').map(Number);
    return minutes % this.schedulePolicy().slot_minutes === 0;
  }

  isOutOfPolicyHours(time: string): boolean {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return false;
    return time < this.schedulePolicy().start_time || time > this.schedulePolicy().max_start_time;
  }

  async onAssign() {
    this.submitted = true;
    if (!this.verifierId) {
      this.alerts.showAlert('Debes seleccionar un verificador.', 'warning');
      return;
    }
    if (!this.selectedTime) {
      this.alerts.showAlert('Debes indicar la hora de inicio de la visita.', 'warning');
      return;
    }
    if (!this.is15MinuteInterval(this.selectedTime)) {
      this.alerts.showAlert(
        `Los horarios deben programarse en bloques exactos de 15 minutos (ejemplos: 2:00, 2:15, 2:30, 2:45). La hora "${this.selectedTime}" no es válida.`,
        'error',
      );
      return;
    }
    if (!this.isValidSchedule()) {
      if (this.selectedTimeHasConflict()) {
        this.alerts.showAlert('Ese horario se cruza con otra visita asignada al verificador.', 'warning');
      } else {
        this.alerts.showAlert('Selecciona un horario disponible y válido dentro de las políticas de agenda.', 'warning');
      }
      return;
    }
    const solicitud = this.facade.solicitudSeleccionada();
    if (!solicitud) return;

    const req = {
      verifier_id: this.verifierId,
      scheduled_for: this.scheduledDateTime()!.toISOString(),
      lock_version: solicitud.lockVersion,
    };

    const success = await this.facade.asignarVerificador(solicitud.id, req);
    if (success) {
      this.alerts.showAlert(
        this.isReassign()
          ? 'Horario de visita reprogramado exitosamente.'
          : 'Verificador asignado y visita programada exitosamente.',
        'success',
      );
      this.router.navigate([
        '/verificacion-distribuidoras/solicitudes-distribuidora',
        solicitud.id,
      ]);
    }
  }

  async onVerifierChange(verifierId: string): Promise<void> {
    this.verifierId = verifierId;
    this.selectedTime = '';
    this.rawTimeInput = '';
    this.schedule.set([]);
    await this.loadSchedule();
  }

  isValidSchedule(): boolean {
    const value = this.scheduledDateTime();
    if (!value) return false;
    return (
      value >= nextAssignableSlot(this.currentTime()) &&
      localTimeKey(value) >= this.schedulePolicy().start_time &&
      localTimeKey(value) <= this.schedulePolicy().max_start_time &&
      value.getMinutes() % this.schedulePolicy().slot_minutes === 0 &&
      !this.hasConflict(value)
    );
  }

  protected selectDate(day: Date): void {
    this.selectedDate = localDateKey(day);
    this.selectedTime = '';
    this.rawTimeInput = '';
  }

  protected onTimeChange(value: string): void {
    this.rawTimeInput = value;
    this.selectedTime = /^\d{2}:\d{2}$/.test(value) ? value : '';
  }

  isItemCurrentApplication(item: AgendaVerificadorDto): boolean {
    const solicitud = this.facade.solicitudSeleccionada();
    if (!solicitud) return false;
    const activeVisit = solicitud.visitas.find((v) => v.estado === 'ASSIGNED');
    if (activeVisit && activeVisit.id === item.id) return true;
    if (item.application_id && item.application_id === solicitud.id) return true;
    if (item.application_number && item.application_number === solicitud.folio) return true;
    return false;
  }

  protected isSelectedDay(day: Date): boolean {
    return localDateKey(day) === this.selectedDate;
  }

  protected hasVisits(day: Date): boolean {
    const key = localDateKey(day);
    return this.schedule().some(
      (item) =>
        localDateKey(new Date(item.scheduled_for)) === key && !this.isItemCurrentApplication(item),
    );
  }

  protected isPastDay(day: Date): boolean {
    return day < todayAt(0);
  }

  protected selectedTimeHasConflict(): boolean {
    const candidate = this.scheduledDateTime();

    return candidate !== null && this.hasConflict(candidate);
  }

  protected async changeMonth(offset: number): Promise<void> {
    const month = new Date(this.visibleMonth());
    month.setMonth(month.getMonth() + offset);
    if (month < startOfMonth(todayAt(0))) return;
    this.visibleMonth.set(month);
    this.selectedDate = localDateKey(month < todayAt(0) ? todayAt(0) : month);
    this.selectedTime = '';
    await this.loadSchedule();
  }

  protected formatVisitTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  protected selectedDayVisits(): (AgendaVerificadorDto & { isCurrentApplication?: boolean })[] {
    return this.schedule()
      .filter((item) => localDateKey(new Date(item.scheduled_for)) === this.selectedDate)
      .map((item) => ({
        ...item,
        isCurrentApplication: this.isItemCurrentApplication(item),
      }));
  }

  private async loadSchedule(): Promise<void> {
    const application = this.facade.solicitudSeleccionada();
    if (!application || !this.verifierId) return;
    const from = new Date(this.visibleMonth());
    const to = new Date(from);
    to.setMonth(to.getMonth() + 1);
    this.scheduleLoading.set(true);
    try {
      this.schedule.set(
        await firstValueFrom(
          this.api.consultarAgendaVerificador(
            application.id,
            this.verifierId,
            from.toISOString(),
            to.toISOString(),
          ),
        ),
      );
    } catch {
      this.alerts.showAlert('No fue posible consultar la agenda del verificador.', 'error');
    } finally {
      this.scheduleLoading.set(false);
    }
  }

  private async loadSchedulePolicy(): Promise<void> {
    try {
      this.schedulePolicy.set(await firstValueFrom(this.api.consultarPoliticaHorario()));
    } catch {
      this.alerts.showAlert('No fue posible consultar el horario global de verificaciones.', 'error');
    }
  }

  private scheduledDateTime(): Date | null {
    return dateTimeFromLocal(this.selectedDate, this.selectedTime);
  }

  private hasConflict(candidate: Date): boolean {
    return this.schedule().some((item) => {
      if (this.isItemCurrentApplication(item)) {
        return false;
      }
      return Math.abs(candidate.getTime() - new Date(item.scheduled_for).getTime()) < 75 * 60_000;
    });
  }

  onCancel() {
    const solicitud = this.facade.solicitudSeleccionada();
    if (solicitud) {
      this.router.navigate([
        '/verificacion-distribuidoras/solicitudes-distribuidora',
        solicitud.id,
      ]);
    } else {
      this.router.navigate(['/verificacion-distribuidoras/solicitudes-distribuidora/revision']);
    }
  }
}

function todayAt(hour: number): Date {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateTimeFromLocal(date: string, time: string): Date | null {
  if (!date || !/^\d{2}:\d{2}$/.test(time)) return null;
  const value = new Date(`${date}T${time}:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}

function calendarGrid(month: Date): (Date | null)[] {
  const mondayOffset = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return [
    ...Array.from({ length: mondayOffset }, () => null),
    ...Array.from(
      { length: days },
      (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1),
    ),
  ];
}

function localTimeKey(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
