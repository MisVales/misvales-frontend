import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ChevronLeft, ChevronRight, LucideAngularModule, Plus, Store, TriangleAlert } from 'lucide-angular';
import { describe, expect, it, vi } from 'vitest';
import { SessionStore } from '../../../../core/session/session.store';
import { DistribuidorasStore } from '../../../distributors/state/distribuidoras.store';
import { SolicitudesListadoStore } from '../../state/solicitudes-listado.store';
import { ListadoSolicitudesPageComponent } from './listado-solicitudes-page.component';

describe('ListadoSolicitudesPageComponent', () => {
  it('muestra primero distribuidoras y las solicitudes en un resumen lateral', () => {
    const distributorsStore = {
      listado: signal([{ id: 'd-1', numero: '', nombreCompleto: 'María Pérez', estado: 'ACTIVE', estadoAcceso: 'ACTIVE', sucursal: { id: 'b-1', nombre: 'Centro' }, coordinador: null, categoria: { id: 'c-1', nombre: 'Plata', descripcion: '', porcentajeGanancia: '0.060000', inicioVigencia: '', finVigencia: null, usuarioAsignoId: '', motivoAsignacion: null, estado: 'ACTIVE' }, lineaInicial: '5000.00', restriccionInicialActiva: false, creadaEn: null, activadaEn: null, versionBloqueo: 1 }]),
      paginacion: signal({ paginaActiva: 1, ultimaPagina: 1, porPagina: 10, total: 1 }),
      filtros: signal({}), cargandoListado: signal(false), error: signal(null), listar: vi.fn(),
    };
    const applicationsStore = {
      datos: signal([]),
      paginacion: signal({ paginaActiva: 1, ultimaPagina: 1, porPagina: 5, total: 0 }),
      estadoCarga: signal(false), error: signal(null), listar: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [
        ListadoSolicitudesPageComponent,
        LucideAngularModule.pick({ ChevronLeft, ChevronRight, Plus, Store, TriangleAlert }),
      ],
      providers: [
        provideRouter([]),
        { provide: DistribuidorasStore, useValue: distributorsStore },
        { provide: SolicitudesListadoStore, useValue: applicationsStore },
        { provide: SessionStore, useValue: { permissions: () => ['distributor_applications.create'], roles: () => ['branch_manager'] } },
      ],
    });

    const fixture = TestBed.createComponent(ListadoSolicitudesPageComponent);
    fixture.detectChanges();

    expect(distributorsStore.listar).toHaveBeenCalledWith(1, 10);
    expect(applicationsStore.listar).toHaveBeenCalledWith(1, 5);
    expect(fixture.nativeElement.querySelector('.directory-panel')?.textContent).toContain('María Pérez');
    expect(fixture.nativeElement.querySelector('.directory-panel')?.textContent).toContain('Plata · 6%');
    expect(fixture.nativeElement.querySelector('.primary-action')?.textContent).toContain('Nueva solicitud');
    expect(fixture.nativeElement.querySelector('.applications-panel')?.textContent).toContain('Solicitudes');
    expect(
      fixture.nativeElement.querySelector('.hub-layout')?.firstElementChild?.classList.contains('directory-panel'),
    ).toBe(true);
  });
});
