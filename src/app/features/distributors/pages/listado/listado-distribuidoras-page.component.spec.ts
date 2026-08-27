import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SessionStore } from '../../../../core/session/session.store';
import { CategoriasService } from '../../../categories/data-access/categorias.service';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import { DistribuidorasStore } from '../../state/distribuidoras.store';
import { ListadoDistribuidorasPageComponent } from './listado-distribuidoras-page.component';
import { DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';
import { AlertService } from '../../../../shared/components/alerts/alert.service';

describe('ListadoDistribuidorasPageComponent tablet cards', () => {
  it('renders each coordinator card as a native link to its detail', async () => {
    const api = { reenviarInvitacion: vi.fn(() => of(undefined)) };
    const store = {
      listado: signal([
        {
          id: 'distributor-1',
          numero: '0001',
          nombreCompleto: 'Distribuidora Uno',
          estado: 'ACTIVE',
          estadoAcceso: 'ACTIVE',
          sucursal: { id: 'branch-1', nombre: 'Matriz' },
          coordinador: null,
          categoria: null,
          lineaInicial: '1000.00',
          restriccionInicialActiva: false,
          creadaEn: '2026-08-18T00:00:00Z',
          activadaEn: null,
          versionBloqueo: 1,
        },
      ]),
      cargandoListado: signal(false),
      paginacion: signal({ paginaActiva: 1, ultimaPagina: 1, porPagina: 10, total: 1 }),
      filtros: signal({}),
      listar: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [ListadoDistribuidorasPageComponent],
      providers: [
        provideRouter([]),
        { provide: DistribuidorasStore, useValue: store },
        { provide: SessionStore, useValue: { roles: () => ['coordinator'] } },
        { provide: DistribuidorasApiService, useValue: api },
        { provide: AlertService, useValue: { showAlert: vi.fn() } },
        {
          provide: OrganizationApiService,
          useValue: {
            getBranches: () => of({ data: [] }),
            getPersonnel: () => of({ data: [] }),
          },
        },
        { provide: CategoriasService, useValue: { listar: () => of({ data: [] }) } },
      ],
    });
    const fixture = TestBed.createComponent(ListadoDistribuidorasPageComponent);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const cardLink = fixture.nativeElement.querySelector(
      'a[href="/distribuidoras/distributor-1"]',
    ) as HTMLAnchorElement;
    expect(cardLink).toBeTruthy();
    expect(cardLink.textContent).toContain('Distribuidora Uno');
  });
});
