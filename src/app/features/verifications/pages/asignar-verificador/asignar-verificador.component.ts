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
  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await Promise.all([
        this.facade.cargarSolicitud(id),
        this.facade.cargarVerificadoresDisponibles(id),
        this.loadSchedulePolicy(),
      ]);
    }
  }

  ngOnDestroy() {
    window.clearInterval(this.clockTimer);
    this.facade.limpiarSeleccion();
  }

  async onAssign() {
    this.submitted = true;
    if (!this.verifierId || !this.isValidSchedule()) {
      this.alerts.showAlert('Selecciona un verificador y un horario disponible.', 'warning');
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
      this.router.navigate([
        '/verificacion-distribuidoras/solicitudes-distribuidora',
        solicitud.id,
      ]);
    }
  }

  async onVerifierChange(verifierId: string): Promise<void> {
    this.verifierId = verifierId;
    this.selectedTime = '';
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
  }

  protected onTimeChange(value: string): void {
    this.selectedTime = /^\d{2}:\d{2}$/.test(value) ? value : '';
  }

  protected isSelectedDay(day: Date): boolean {
    return localDateKey(day) === this.selectedDate;
  }

  protected hasVisits(day: Date): boolean {
    const key = localDateKey(day);
    return this.schedule().some((item) => localDateKey(new Date(item.scheduled_for)) === key);
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

  protected selectedDayVisits(): AgendaVerificadorDto[] {
    return this.schedule().filter(
      (item) => localDateKey(new Date(item.scheduled_for)) === this.selectedDate,
    );
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
    return this.schedule().some(
      (item) =>
        Math.abs(candidate.getTime() - new Date(item.scheduled_for).getTime()) < 75 * 60_000,
    );
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
