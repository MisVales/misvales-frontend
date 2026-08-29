import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { ConfiguracionesStore } from '../../estado/configuraciones.store';
import { ConfiguracionDetalleComponent } from './configuracion-detalle.component';

describe('ConfiguracionDetalleComponent', () => {
  let fixture: ComponentFixture<ConfiguracionDetalleComponent>;
  let component: ConfiguracionDetalleComponent;
  const alerts = { success: vi.fn(), showAlert: vi.fn() };
  const store = {
    definicionSeleccionada: signal({
      id: 'definition-1',
      clave: 'TEST_PERCENTAGE_CONFIGURATION',
      nombre: 'Porcentaje de prueba',
      descripcion: 'Configuración porcentual de prueba',
      tipoValor: 'PERCENTAGE' as const,
      unidad: 'percentage',
      requerida: true,
      sensible: false,
      estado: 'ACTIVE' as const,
      versionRegistro: 0,
      valorActual: '0.1000',
    }),
    versiones: signal([]),
    error: signal<string | null>(null),
    estadoCarga: signal(false),
    consultarDefinicion: vi.fn().mockResolvedValue(undefined),
    consultarVersiones: vi.fn().mockResolvedValue(undefined),
    actualizarActual: vi.fn().mockResolvedValue(undefined),
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
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ clave: 'TEST_PERCENTAGE_CONFIGURATION' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracionDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('muestra el valor vigente y el historial de auditoría', () => {
    expect(fixture.nativeElement.textContent).toContain('Valor actual');
    expect(fixture.nativeElement.textContent).toContain('10 %');
    expect(fixture.nativeElement.textContent).toContain('Historial de cambios');
    expect(fixture.nativeElement.textContent).not.toContain('Nueva versión en borrador');
  });

  it('muestra porcentajes completos al editar', () => {
    const valueInput = fixture.nativeElement.querySelector('input[formcontrolname="scalar"]') as HTMLInputElement;
    expect(valueInput.value).toBe('10');
    expect(valueInput.max).toBe('100');
  });

  it('guarda una configuración sin pasos de borrador ni publicación', async () => {
    const instance = component as any;
    instance.versionForm.patchValue({ scalar: '12.5', reason: 'Ajuste autorizado de comisión' });

    await instance.guardarCambios();

    expect(store.actualizarActual).toHaveBeenCalledWith('TEST_PERCENTAGE_CONFIGURATION', {
      value: 0.125,
      reason: 'Ajuste autorizado de comisión',
    });
    expect(alerts.success).toHaveBeenCalledWith('La configuración se actualizó correctamente.');
  });

  it('no guarda un porcentaje mayor a 100', async () => {
    const instance = component as any;
    instance.versionForm.patchValue({ scalar: '101', reason: 'Ajuste autorizado de comisión' });

    await instance.guardarCambios();

    expect(store.actualizarActual).not.toHaveBeenCalled();
  });
});
