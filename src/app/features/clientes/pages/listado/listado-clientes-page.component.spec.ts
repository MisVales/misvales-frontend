import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoClientesPageComponent } from './listado-clientes-page.component';
import { ClientesStore } from '../../state/clientes.store';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import { DistribuidorasApiService } from '../../../distribuidoras/data-access/api/distribuidoras-api.service';
import { SessionStore } from '../../../../core/session/session.store';

describe('ListadoClientesPageComponent', () => {
  let component: ListadoClientesPageComponent;
  let fixture: ComponentFixture<ListadoClientesPageComponent>;
  let mockStore: any;

  beforeEach(async () => {
    mockStore = {
      listado: vi.fn().mockReturnValue([]),
      cargandoListado: vi.fn().mockReturnValue(false),
      filtros: vi.fn().mockReturnValue({}),
      cargarListado: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ListadoClientesPageComponent],
      providers: [
        { provide: ClientesStore, useValue: mockStore },
        { provide: OrganizationApiService, useValue: { getBranches: () => of({ data: [] }) } },
        { provide: DistribuidorasApiService, useValue: { listar: () => of({ datos: [] }) } },
        { provide: SessionStore, useValue: { roles: () => ['general_manager'], permissions: () => ['clients.create'] } },
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListadoClientesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call cargarListado on init', () => {
    expect(mockStore.cargarListado).toHaveBeenCalled();
  });
});
