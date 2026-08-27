import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  Check,
  Circle,
  CircleCheck,
  CirclePlay,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Hourglass,
  LucideAngularModule,
  Play,
  RefreshCw,
  TriangleAlert,
  Users,
} from 'lucide-angular';
import { VerificacionDistribuidorasApiService } from '@features/verifications/data-access/api/verificacion-distribuidoras-api.service';
import { VerifierHomeComponent } from './verifier-home.component';

describe('VerifierHomeComponent', () => {
  it('renderiza todos los indicadores y paneles después de recibir visitas', async () => {
    await TestBed.configureTestingModule({
      imports: [
        VerifierHomeComponent,
        LucideAngularModule.pick({ ArrowRight, Bell, CalendarCheck, Check, Circle, CircleCheck, CirclePlay, ClipboardCheck, ClipboardList, FileText, Hourglass, Play, RefreshCw, TriangleAlert, Users }),
      ],
      providers: [
        provideRouter([]),
        {
          provide: VerificacionDistribuidorasApiService,
          useValue: {
            listarVisitasAsignadas: () => of({ data: [visit], total: 1, page: 1, perPage: 100 }),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(VerifierHomeComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('.kpi-card')).toHaveLength(4);
    expect(root.querySelectorAll('.panel')).toHaveLength(4);
    expect(root.querySelectorAll('lucide-icon svg').length).toBeGreaterThanOrEqual(8);
    expect(root.textContent).toContain('Solicitud de prueba');
  });

  it('muestra una ilustración en cada panel cuando no hay visitas', async () => {
    await TestBed.configureTestingModule({
      imports: [
        VerifierHomeComponent,
        LucideAngularModule.pick({ Bell, CalendarCheck, Check, ClipboardCheck, ClipboardList, Hourglass, RefreshCw, TriangleAlert, Users }),
      ],
      providers: [
        provideRouter([]),
        {
          provide: VerificacionDistribuidorasApiService,
          useValue: {
            listarVisitasAsignadas: () => of({ data: [], total: 0, page: 1, perPage: 100 }),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(VerifierHomeComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const emptyStates = root.querySelectorAll('app-empty-state');
    expect(emptyStates).toHaveLength(4);
    expect(root.querySelectorAll('app-empty-state img')).toHaveLength(4);
    expect(root.querySelector('.pending-panel table')).toBeNull();
    expect(root.querySelector('.activity-panel .activity-list')).toBeNull();
  });

  it('tolera visitas sin media_files y muestra la hora de negocio', async () => {
    const visitWithoutMedia = {
      ...visit,
      scheduled_for: '2026-08-25T21:00:00.000Z',
      media_files: undefined,
    };
    await TestBed.configureTestingModule({
      imports: [
        VerifierHomeComponent,
        LucideAngularModule.pick({ ArrowRight, Bell, CalendarCheck, Check, Circle, CircleCheck, CirclePlay, ClipboardCheck, ClipboardList, FileText, Hourglass, Play, RefreshCw, TriangleAlert, Users }),
      ],
      providers: [
        provideRouter([]),
        {
          provide: VerificacionDistribuidorasApiService,
          useValue: {
            listarVisitasAsignadas: () => of({ data: [visitWithoutMedia], total: 1, page: 1, perPage: 100 }),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(VerifierHomeComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('25/08/2026, 3:00 p.m.');
    expect(() => fixture.componentInstance.pendingLabel(visitWithoutMedia)).not.toThrow();
  });
});

const visit = {
  id: 'visit-1', application_id: 'app-1', verifier_id: 'user-1', status: 'IN_PROGRESS', result: null,
  observations: null, assigned_at: '2026-08-24T08:00:00-06:00', scheduled_for: '2026-08-24T10:00:00-06:00',
  started_at: '2026-08-24T10:00:00-06:00', completed_at: null, differences_payload: { items: [] },
  media_files: [], lock_version: 1,
  application: {
    id: 'app-1', application_number: 'SOL-001', applicant: { full_name: 'Solicitud de prueba', curp_masked: null },
    branch: { id: 'branch-1', name: 'Centro' }, coordinator: { id: 'coord-1', name: 'Coordinación' },
    status: 'PHYSICAL_VERIFICATION', submitted_at: null, completion: 100, lock_version: 1,
  },
} as const;
