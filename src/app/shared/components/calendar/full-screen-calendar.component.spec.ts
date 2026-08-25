import '@angular/compiler';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  FullScreenCalendarComponent,
  type FullScreenCalendarEvent,
} from './full-screen-calendar.component';

describe('FullScreenCalendarComponent', () => {
  let fixture: ComponentFixture<CalendarHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarHostComponent, LucideAngularModule.pick({ ChevronLeft, ChevronRight })],
    }).compileComponents();
    fixture = TestBed.createComponent(CalendarHostComponent);
  });

  it('muestra las visitas reales dentro del mes y del día seleccionado', () => {
    const events: FullScreenCalendarEvent[] = [
      {
        id: 'visit-1',
        datetime: '2026-08-24T15:00:00-06:00',
        title: 'Alberto Trejo Saucedo',
        time: '3:00 p.m.',
        status: 'En progreso',
      },
    ];
    fixture.componentInstance.events.set(events);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Alberto Trejo Saucedo');
    expect(fixture.nativeElement.textContent).toContain('En progreso');
  });

  it('emite el evento seleccionado desde la agenda', () => {
    const event: FullScreenCalendarEvent = {
      id: 'visit-1',
      datetime: '2026-08-24T15:00:00-06:00',
      title: 'Visita programada',
      time: '3:00 p.m.',
    };
    let selectedId = '';
    fixture.componentInstance.events.set([event]);
    fixture.componentInstance.onSelected = (selected) => (selectedId = selected.id);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.agenda-event') as HTMLButtonElement).click();
    expect(selectedId).toBe('visit-1');
  });

  it('selecciona la fecha desde el resumen sin abrir todavía la visita', () => {
    const event: FullScreenCalendarEvent = {
      id: 'visit-25',
      datetime: '2026-08-25T15:00:00-06:00',
      title: 'Alberto Trejo Saucedo',
      time: '3:00 p.m.',
    };
    let opened = false;
    fixture.componentInstance.events.set([event]);
    fixture.componentInstance.onSelected = () => (opened = true);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.summary-visit') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.selected-agenda').textContent).toContain(
      'martes, 25 de agosto',
    );
    expect(opened).toBe(false);
  });
});

@Component({
  standalone: true,
  imports: [FullScreenCalendarComponent],
  template: `<app-full-screen-calendar [events]="events()" (eventSelected)="onSelected($event)" />`,
})
class CalendarHostComponent {
  readonly events = signal<readonly FullScreenCalendarEvent[]>([]);
  onSelected = (_event: FullScreenCalendarEvent): void => undefined;
}
