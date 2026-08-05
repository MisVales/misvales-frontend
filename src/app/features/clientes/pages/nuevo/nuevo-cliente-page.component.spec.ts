import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevoClientePageComponent } from './nuevo-cliente-page.component';
import { ClientesStore } from '../../state/clientes.store';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesApiService } from '../../data-access/api/clientes-api.service';
import { of, throwError } from 'rxjs';

describe('NuevoClientePageComponent', () => {
  let component: NuevoClientePageComponent;
  let fixture: ComponentFixture<NuevoClientePageComponent>;
  let mockStore: any;

  beforeEach(async () => {
    mockStore = {
      error: jasmine.createSpy('error').and.returnValue('Error mock'),
      crearCliente: jasmine.createSpy('crearCliente').and.returnValue(throwError(() => new Error('Error')))
    };

    await TestBed.configureTestingModule({
      imports: [NuevoClientePageComponent],
      providers: [
        { provide: ClientesStore, useValue: mockStore },
        { provide: ClientesApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevoClientePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate short CURP', () => {
    component.form.get('identidad.curp')?.setValue('SHORT');
    expect(component.form.get('identidad.curp')?.invalid).toBeTrue();
  });

  it('should auto capitalize CURP on changes', () => {
    component.form.get('identidad.curp')?.setValue('pelj800101hjcxxx');
    expect(component.form.get('identidad.curp')?.value).toBe('PELJ800101HJCXXX');
  });

  it('should catch error on submit failure', async () => {
    // Fill required to mock valid form minimally or just force invalid = false
    spyOnProperty(component.form, 'invalid').and.returnValue(false);
    
    await component.confirmar();
    
    expect(mockStore.crearCliente).toHaveBeenCalled();
    expect(component.errorEnvio).toBe('Error mock');
  });
});
