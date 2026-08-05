import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListadoClientesPageComponent } from './listado-clientes-page.component';
import { ClientesStore } from '../../state/clientes.store';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ListadoClientesPageComponent', () => {
  let component: ListadoClientesPageComponent;
  let fixture: ComponentFixture<ListadoClientesPageComponent>;
  let mockStore: any;

  beforeEach(async () => {
    mockStore = {
      listado: jasmine.createSpy('listado').and.returnValue([]),
      cargandoListado: jasmine.createSpy('cargandoListado').and.returnValue(false),
      filtros: jasmine.createSpy('filtros').and.returnValue({}),
      cargarListado: jasmine.createSpy('cargarListado')
    };

    await TestBed.configureTestingModule({
      imports: [ListadoClientesPageComponent],
      providers: [
        { provide: ClientesStore, useValue: mockStore },
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
