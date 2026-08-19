import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { DateTime } from 'luxon';
import { describe, expect, it, vi } from 'vitest';
import { AlertService } from '../../../../shared/services/alert.service';
import { ConfiguracionesStore } from '../../estado/configuraciones.store';
import { ConfiguracionDetalleComponent } from './configuracion-detalle.component';

describe('ConfiguracionDetalleComponent', () => {
  let fixture: ComponentFixture<ConfiguracionDetalleComponent>;
  let component: ConfiguracionDetalleComponent;
  const alerts = { success: vi.fn() };
  const store = {
    definicionSeleccionada: signal({
      id: 'definition-1',
      clave: 'CUT_DAY_OF_MONTH',
      nombre: 'Día global de corte',
      descripcion: 'Día de corte',
      tipoValor: 'INTEGER' as const,
      unidad: 'day_of_month',
      requerida: true,
      sensible: false,
      estado: 'ACTIVE' as const,
      versionRegistro: 0,
      valorActual: 25,
    }),
    versiones: signal([]),
    error: signal<string | null>(null),
    estadoCarga: signal(false),
    consultarDefinicion: vi.fn().mockResolvedValue(undefined),
    consultarVersiones: vi.fn().mockResolvedValue(undefined),
    crearVersion: vi.fn().mockResolvedValue(undefined),
    publicarVersion: vi.fn().mockResolvedValue(undefined),
    desactivarVersion: vi.fn().mockResolvedValue(undefined),
    limpiarError: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ConfiguracionDetalleComponent],
      providers: [
        provideRouter([]),
        { provide: ConfiguracionesStore, useValue: store },
        { provide: AlertService, useValue: alerts },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ clave: 'CUT_DAY_OF_MONTH' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracionDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('guarda el borrador del día de corte sin exigir campos bancarios ocultos', async () => {
    const instance = component as any;
    instance.creando.set(true);
    instance.versionForm.patchValue({
      scalar: '25',
      effectiveFrom: DateTime.now().plus({ days: 1 }).toFormat("yyyy-LL-dd'T'HH:mm"),
      reason: 'Actualización programada del corte',
    });

    await instance.crearVersion();

    expect(store.crearVersion).toHaveBeenCalledWith('CUT_DAY_OF_MONTH', expect.objectContaining({
      value: 25,
      reason: 'Actualización programada del corte',
    }));
    expect(alerts.success).toHaveBeenCalledWith('El borrador de configuración se guardó correctamente.');
  });

  it('muestra el error del valor en cuanto se enfoca vacío', () => {
    const instance = component as any;
    instance.creando.set(true);
    fixture.detectChanges();

    const valueInput = fixture.nativeElement.querySelector('input[formcontrolname="scalar"]') as HTMLInputElement;
    valueInput.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El valor es obligatorio.');
    expect(valueInput.placeholder).toBe('Ej. 25');
  });

  it('indica que el motivo debe tener al menos 10 caracteres', () => {
    const instance = component as any;
    instance.creando.set(true);
    fixture.detectChanges();

    const reasonInput = fixture.nativeElement.querySelectorAll('input[formcontrolname="reason"]')[0] as HTMLInputElement;
    reasonInput.dispatchEvent(new Event('focus'));
    reasonInput.value = 'si';
    reasonInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El motivo debe tener al menos 10 caracteres.');
  });

  it('explica siempre el mínimo de caracteres para los dos motivos', () => {
    const instance = component as any;
    instance.creando.set(true);
    fixture.detectChanges();

    const guides = fixture.nativeElement.textContent.match(/Mínimo 10 caracteres\./g) ?? [];
    expect(guides).toHaveLength(2);
  });

  it('muestra todos los errores al presionar guardar sin haber enfocado los campos', async () => {
    const instance = component as any;
    instance.creando.set(true);
    fixture.detectChanges();

    await instance.crearVersion();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El valor es obligatorio.');
    expect(fixture.nativeElement.textContent).toContain('El inicio de vigencia es obligatorio.');
    expect(fixture.nativeElement.textContent).toContain('El motivo es obligatorio.');
  });

  it('muestra el mínimo del motivo al presionar guardar', async () => {
    const instance = component as any;
    instance.creando.set(true);
    instance.versionForm.patchValue({
      scalar: '25',
      effectiveFrom: DateTime.now().plus({ days: 1 }).toFormat("yyyy-LL-dd'T'HH:mm"),
      reason: 'ssdds',
    });
    fixture.detectChanges();

    await instance.crearVersion();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El motivo debe tener al menos 10 caracteres.');
    expect(store.crearVersion).not.toHaveBeenCalled();
  });

  it('muestra el motivo obligatorio al intentar publicar o desactivar', async () => {
    const instance = component as any;
    const version = { id: 'version-1', versionRegistro: 0 };

    await instance.publicar(version);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('El motivo es obligatorio.');

    instance.transitionForm.reset();
    await instance.desactivar(version);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('El motivo es obligatorio.');
  });

  it('sincroniza el texto visible con los controles antes de guardar', () => {
    const instance = component as any;
    instance.creando.set(true);
    fixture.detectChanges();

    const valueInput = fixture.nativeElement.querySelector('input[formcontrolname="scalar"]') as HTMLInputElement;
    valueInput.value = '25';
    valueInput.dispatchEvent(new Event('input'));

    const reasonInput = fixture.nativeElement.querySelector('input[formcontrolname="reason"]') as HTMLInputElement;
    reasonInput.value = 'Motivo de prueba válido';
    reasonInput.dispatchEvent(new Event('input'));

    expect(instance.versionForm.controls.scalar.value).toBe('25');
    expect(instance.versionForm.controls.reason.value).toBe('Motivo de prueba válido');
    expect(store.limpiarError).toHaveBeenCalled();
  });

  it('guarda después de capturar los tres campos desde la vista', async () => {
    const instance = component as any;
    instance.creando.set(true);
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input[formcontrolname]') as NodeListOf<HTMLInputElement>;
    inputs[0].value = '25';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = DateTime.now().plus({ days: 1 }).toFormat("yyyy-LL-dd'T'HH:mm");
    inputs[1].dispatchEvent(new Event('input'));
    inputs[1].dispatchEvent(new Event('change'));
    inputs[2].value = 'Actualización capturada desde la vista';
    inputs[2].dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(store.crearVersion).toHaveBeenCalledWith('CUT_DAY_OF_MONTH', expect.objectContaining({
      value: 25,
      reason: 'Actualización capturada desde la vista',
    }));
  });
});
