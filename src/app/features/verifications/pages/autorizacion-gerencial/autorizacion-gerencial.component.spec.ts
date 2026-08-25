import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import {
  ArrowLeft,
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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionStore } from '../../../../core/session/session.store';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { ConfirmationService } from '../../../../shared/dialogs/confirmation.service';
import { MediaApiService } from '../../../../core/api/media/media-api.service';
import { VerificacionDistribuidorasApiService } from '../../data-access/api/verificacion-distribuidoras-api.service';
import { VerificacionDistribuidorasFacade } from '../../state/verificacion-distribuidoras.facade';
import { AutorizacionGerencialComponent } from './autorizacion-gerencial.component';
import { EstadoSolicitudComponent } from '../../components/estado-solicitud/estado-solicitud.component';
import { LineaTiempoSolicitudComponent } from '../../components/linea-tiempo-solicitud/linea-tiempo-solicitud.component';
import { GaleriaEvidenciasComponent } from '../../components/galeria-evidencias/galeria-evidencias.component';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { of } from 'rxjs';

describe('AutorizacionGerencialComponent', () => {
  const solicitudes = signal<any[]>([]);
  const solicitudSeleccionada = signal<any | null>(null);
  const routeParamId = signal<string | null>(null);

  const facade = {
    solicitudes,
    totalSolicitudes: signal(0),
    pageSolicitudes: signal(1),
    perPageSolicitudes: signal(20),
    isLoading: signal(false),
    error: signal<string | null>(null),
    solicitudSeleccionada,
    cargarSolicitud: vi.fn(),
    cargarSolicitudes: vi.fn(),
    limpiarSeleccion: vi.fn(),
    clearError: vi.fn(),
  };

  beforeEach(async () => {
    solicitudes.set([]);
    solicitudSeleccionada.set(null);
    routeParamId.set(null);
    facade.totalSolicitudes.set(0);

    await TestBed.configureTestingModule({
      imports: [
        AutorizacionGerencialComponent,
        EstadoSolicitudComponent,
        LineaTiempoSolicitudComponent,
        GaleriaEvidenciasComponent,
        StatusLabelPipe,
        LucideAngularModule.pick({
          ArrowLeft,
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
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? routeParamId() : null),
              },
            },
          },
        },
        { provide: VerificacionDistribuidorasFacade, useValue: facade },
        {
          provide: SessionStore,
          useValue: { roles: () => ['branch_manager'] },
        },
        { provide: AlertService, useValue: { showAlert: vi.fn() } },
        { provide: ConfirmationService, useValue: { confirm: vi.fn() } },
        { provide: MediaApiService, useValue: { download: vi.fn().mockReturnValue(of(new Blob())) } },
        { provide: VerificacionDistribuidorasApiService, useValue: { descargarEvidencia: vi.fn().mockReturnValue(of(new Blob())) } },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('presenta la bandeja gerencial y sus estados vacíos ilustrados', () => {
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

  it('muestra el expediente completo de la solicitud para dictamen gerencial', () => {
    const solicitud = {
      id: 'c87bd0e9-b6f5-4fff-b621-ab7a7917c699',
      folio: 'SOL-2026-000004',
      aspirante: {
        nombreCompleto: 'Jorge Luis Ibarra Villa',
        curpEnmascarado: 'GACA********GRNZA1',
        rfcEnmascarado: 'GAC*******HD1',
      },
      sucursal: { id: 'branch-1', nombre: 'Sucursal Matamoros' },
      coordinadorId: 'coord-1',
      estado: 'MANAGER_AUTHORIZATION',
      fechaEnvio: '2026-08-25T22:26:26.000000Z',
      avance: 100,
      visitas: [
        {
          id: 'visit-1',
          solicitudId: 'c87bd0e9-b6f5-4fff-b621-ab7a7917c699',
          solicitudNombre: 'Jorge Luis Ibarra Villa',
          verificadorId: 'verifier-1',
          estado: 'COMPLETED',
          resultadoFisico: 'FAVORABLE',
          observacionesGenerales: 'Domicilio verificado correctamente',
          fechaAsignacion: '2026-08-25T17:06:02-06:00',
          fechaProgramada: '2026-08-25T17:00:00-06:00',
          fechaInicio: '2026-08-25T17:06:12-06:00',
          fechaFin: '2026-08-25T17:07:46-06:00',
          diferencias: [],
          evidencias: [],
          evidenciasDeclaradas: [],
          lockVersion: 7,
        },
      ],
      correcciones: [],
      evaluaciones: [],
      ultimaEvaluacion: {
        id: 'eval-1',
        coordinadorId: 'coord-1',
        dictamen: 'COMPLIES',
        motivo: 'Cumple con el perfil requerido',
        fechaEvaluacion: '2026-08-25T17:08:52-06:00',
      },
      autorizacion: null,
      datosDeclarados: {
        personal_data: {
          first_name: 'Jorge Luis',
          first_last_name: 'Ibarra',
          second_last_name: 'Villa',
          email: 'jorge@test.com',
          phone_number: '+528712004631',
        },
        residences: [
          {
            street: 'porsoriana',
            exterior_number: '123',
            neighborhood: 'Matamoros Centro',
            housing_tenure: 'OWNED',
          },
        ],
        vehicles: [
          {
            vehicle_type: 'SUV',
            brand: 'Dodge',
            model: 'Journey',
            model_year: 2018,
          },
        ],
      },
      evidenciasDeclaradas: [],
      lockVersion: 58,
    };

    routeParamId.set('c87bd0e9-b6f5-4fff-b621-ab7a7917c699');
    solicitudSeleccionada.set(solicitud);

    const fixture = TestBed.createComponent(AutorizacionGerencialComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Autorización Gerencial Definitiva');
    expect(text).toContain('SOL-2026-000004');
    expect(text).toContain('Jorge Luis Ibarra Villa');
    expect(text).toContain('Dictámenes Previos');
    expect(text).toContain('Datos Declarados del Aspirante');
    expect(text).toContain('Visita de Verificación Física');
    expect(text).toContain('Decisión Gerencial');
    expect(text).toContain('Cumple con el perfil requerido');
    expect(text).toContain('Domicilio verificado correctamente');
  });
});
