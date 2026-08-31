import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevoClientePageComponent } from './nuevo-cliente-page.component';
import { ClientesStore } from '../../state/clientes.store';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesApiService } from '../../data-access/api/clientes-api.service';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('NuevoClientePageComponent', () => {
  let component: NuevoClientePageComponent;
  let fixture: ComponentFixture<NuevoClientePageComponent>;
  let mockStore: any;

  beforeEach(async () => {
    mockStore = {
      error: vi.fn().mockReturnValue('Error mock'),
      crearCliente: vi.fn().mockReturnValue(throwError(() => new Error('Error')))
    };

    await TestBed.configureTestingModule({
      imports: [NuevoClientePageComponent],
      providers: [
        { provide: ClientesStore, useValue: mockStore },
        { provide: ClientesApiService, useValue: {} },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: Router, useValue: { navigate: vi.fn() } }
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

  it('should require the client first name', () => {
    component.form.controls.first_name.setValue('');
    expect(component.form.controls.first_name.hasError('required')).toBe(true);
  });

  it('should require the client CURP', () => {
    component.form.controls.curp.setValue('');
    expect(component.form.controls.curp.hasError('required')).toBe(true);
  });

  it('should reject a first surname longer than the current limit', () => {
    component.form.controls.first_last_name.setValue('A'.repeat(101));
    expect(component.form.controls.first_last_name.hasError('maxlength')).toBe(true);
  });

});
