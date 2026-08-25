import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export type CalendarEventTone = 'blue' | 'orange' | 'green' | 'red' | 'purple';

export interface FullScreenCalendarEvent {
  id: string;
  datetime: string;
  title: string;
  time: string;
  subtitle?: string;
  status?: string;
  tone?: CalendarEventTone;
}

interface CalendarDay {
  date: Date;
  key: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: readonly FullScreenCalendarEvent[];
}

@Component({
  // Calendario operativo reutilizable para vistas de agenda.
  selector: 'app-full-screen-calendar',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './full-screen-calendar.component.html',
  styleUrl: './full-screen-calendar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullScreenCalendarComponent {
  private readonly calendarEvents = signal<readonly FullScreenCalendarEvent[]>([]);

  @Input()
  set events(value: readonly FullScreenCalendarEvent[]) {
    this.calendarEvents.set(value ?? []);
  }

  @Input() emptyMessage = 'No hay eventos programados para este día.';
  @Output() readonly eventSelected = new EventEmitter<FullScreenCalendarEvent>();

  private readonly today = startOfDay(new Date());
  protected readonly currentMonth = signal(startOfMonth(this.initialMonth()));
  protected readonly selectedDate = signal(this.today);

  protected readonly monthTitle = computed(() =>
    new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(
      this.currentMonth(),
    ),
  );

  protected readonly monthRange = computed(() => {
    const month = this.currentMonth();
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const formatter = new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return `${formatter.format(month)} — ${formatter.format(end)}`;
  });

  protected readonly todayMonth = new Intl.DateTimeFormat('es-MX', { month: 'short' })
    .format(this.today)
    .replace('.', '');
  protected readonly todayNumber = this.today.getDate();

  protected readonly days = computed<readonly CalendarDay[]>(() => {
    const month = this.currentMonth();
    const selected = this.selectedDate();
    const firstGridDay = startOfWeek(month);
    const lastMonthDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const lastGridDay = endOfWeek(lastMonthDay);
    const eventsByDay = new Map<string, FullScreenCalendarEvent[]>();

    for (const event of this.calendarEvents()) {
      const date = parseDate(event.datetime);
      if (!date) continue;
      const key = dateKey(date);
      eventsByDay.set(key, [...(eventsByDay.get(key) ?? []), event]);
    }

    const days: CalendarDay[] = [];
    for (let date = new Date(firstGridDay); date <= lastGridDay; date = addDays(date, 1)) {
      const key = dateKey(date);
      days.push({
        date,
        key,
        dayNumber: date.getDate(),
        inCurrentMonth: date.getMonth() === month.getMonth(),
        isToday: sameDay(date, this.today),
        isSelected: sameDay(date, selected),
        events: (eventsByDay.get(key) ?? []).sort(
          (left, right) =>
            parseDate(left.datetime)!.getTime() - parseDate(right.datetime)!.getTime(),
        ),
      });
    }
    return days;
  });

  protected readonly selectedEvents = computed(
    () => this.days().find((day) => day.isSelected)?.events ?? [],
  );
  protected readonly upcomingEvents = computed(() =>
    [...this.calendarEvents()]
      .filter((event) => parseDate(event.datetime) !== null)
      .sort(
        (left, right) => parseDate(left.datetime)!.getTime() - parseDate(right.datetime)!.getTime(),
      ),
  );

  protected previousMonth(): void {
    const month = this.currentMonth();
    this.currentMonth.set(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  }

  protected nextMonth(): void {
    const month = this.currentMonth();
    this.currentMonth.set(new Date(month.getFullYear(), month.getMonth() + 1, 1));
  }

  protected goToToday(): void {
    this.currentMonth.set(startOfMonth(this.today));
    this.selectedDate.set(this.today);
  }

  protected selectDay(day: CalendarDay): void {
    this.selectedDate.set(day.date);
    if (!day.inCurrentMonth) this.currentMonth.set(startOfMonth(day.date));
  }

  protected selectEvent(event: FullScreenCalendarEvent, click: Event): void {
    click.stopPropagation();
    this.eventSelected.emit(event);
  }

  protected focusEventDay(event: FullScreenCalendarEvent): void {
    const date = parseDate(event.datetime);
    if (!date) return;
    this.currentMonth.set(startOfMonth(date));
    this.selectedDate.set(startOfDay(date));
  }

  protected eventDateLabel(event: FullScreenCalendarEvent): string {
    const date = parseDate(event.datetime);
    if (!date) return 'Fecha pendiente';
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  }

  protected isEventDaySelected(event: FullScreenCalendarEvent): boolean {
    const date = parseDate(event.datetime);
    return date !== null && sameDay(date, this.selectedDate());
  }

  protected selectedDateLabel(): string {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(this.selectedDate());
  }

  private initialMonth(): Date {
    const firstEvent = this.calendarEvents()
      .map((event) => parseDate(event.datetime))
      .find((date): date is Date => date !== null);
    return firstEvent ?? this.today;
  }
}

function parseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeek(date: Date): Date {
  const result = startOfDay(date);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

function endOfWeek(date: Date): Date {
  const result = startOfDay(date);
  result.setDate(result.getDate() + (6 - result.getDay()));
  return result;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function sameDay(left: Date, right: Date): boolean {
  return dateKey(left) === dateKey(right);
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
