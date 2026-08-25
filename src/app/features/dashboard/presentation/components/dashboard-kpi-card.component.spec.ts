import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AlertTriangle, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { describe, expect, it } from 'vitest';
import { DashboardKpiCardComponent } from './dashboard-kpi-card.component';

describe('DashboardKpiCardComponent', () => {
  it('renderiza el indicador completo con iconos registrados', async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardKpiCardComponent,
        LucideAngularModule.pick({ AlertTriangle, ChevronRight }),
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardKpiCardComponent);
    fixture.componentRef.setInput('item', {
      id: 'pending',
      label: 'Pendientes',
      value: 3,
      icon: 'alert-triangle',
      tone: 'orange',
      route: '/pending',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Pendientes');
    expect(fixture.nativeElement.textContent).toContain('3');
    expect(fixture.nativeElement.querySelectorAll('svg')).toHaveLength(2);
  });
});
