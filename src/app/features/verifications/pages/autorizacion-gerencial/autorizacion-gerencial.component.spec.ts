import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  LucideAngularModule,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-angular';
import { describe, expect, it, vi } from 'vitest';
import { SessionStore } from '../../../../core/session/session.store';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { ConfirmationService } from '../../../../shared/dialogs/confirmation.service';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { AutorizacionGerencialComponent } from './autorizacion-gerencial.component';

describe('AutorizacionGerencialComponent', () => {
  it('presenta la bandeja gerencial y sus estados vacíos ilustrados', async () => {
    const solicitudes = signal<any[]>([]);
    const facade = {
      solicitudes,
      totalSolicitudes: signal(0),
      pageSolicitudes: signal(1),
      perPageSolicitudes: signal(20),
      isLoading: signal(false),
      error: signal<string | null>(null),
      solicitudSeleccionada: signal(null),
      cargarSolicitudes: vi.fn(),
      limpiarSeleccion: vi.fn(),
      clearError: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [
        AutorizacionGerencialComponent,
        LucideAngularModule.pick({
          ArrowRight,
          Building2,
          ChevronLeft,
          ChevronRight,
          ListChecks,
          RefreshCw,
          Search,
          ShieldCheck,
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: VerificacionDistribuidorasFacade, useValue: facade },
        {
          provide: SessionStore,
          useValue: { roles: () => ['branch_manager'] },
        },
        { provide: AlertService, useValue: { showAlert: vi.fn() } },
        { provide: ConfirmationService, useValue: { confirm: vi.fn() } },
      ],
    });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(AutorizacionGerencialComponent);
    fixture.detectChanges();

    expect(facade.cargarSolicitudes).toHaveBeenCalledWith(1, 20, 'MANAGER_AUTHORIZATION');
    expect(fixture.nativeElement.textContent).toContain('Solicitudes por autorizar');
    expect(fixture.nativeElement.textContent).toContain('Mi sucursal');
    expect(fixture.nativeElement.querySelector('img')?.getAttribute('src')).toBe('/no-found-1.png');

    fixture.componentInstance.search.set('sin coincidencias');
    solicitudes.set([
      {
        id: 'application-1',
        folio: 'SOL-2026-000001',
        aspirante: { nombreCompleto: 'Pepe Pérez' },
        sucursal: { nombre: 'Sucursal Matamoros' },
        estado: 'MANAGER_AUTHORIZATION',
        fechaEnvio: '2026-08-23T12:00:00Z',
      },
    ]);
    facade.totalSolicitudes.set(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')?.getAttribute('src')).toBe('/no-found-2.png');
  });
});
