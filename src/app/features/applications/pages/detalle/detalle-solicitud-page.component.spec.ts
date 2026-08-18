import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AlertService } from '../../../../shared/services/alert.service';
import { SolicitudDetalleStore } from '../../state/solicitud-detalle.store';
import { DetalleSolicitudPageComponent } from './detalle-solicitud-page.component';

const alerts = {
  clear: vi.fn(),
  showAlert: vi.fn(),
};

describe('DetalleSolicitudPageComponent', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('keeps the current section when its form rejects the navigation', () => {
    const component = createComponent();
    component.pasoActual = 'datos-personales';
    (component as any).datosPersonalesForm = {
      mensajeBloqueoCambio: 'Corrige los campos marcados antes de cambiar de pestaña.',
      puedeCambiarDePaso: () => false,
    };

    component.cambiarPaso('familiares');

    expect(component.pasoActual).toBe('datos-personales');
    expect(alerts.showAlert).toHaveBeenCalledWith(
      'Corrige los campos marcados antes de cambiar de pestaña.',
      'warning',
    );
  });

  it('changes section only after the active form allows it', () => {
    const component = createComponent();
    component.pasoActual = 'familiares';
    (component as any).familiaresForm = {
      puedeCambiarDePaso: () => true,
    };

    component.cambiarPaso('vehiculos');

    expect(component.pasoActual).toBe('vehiculos');
    expect(alerts.clear).toHaveBeenCalledOnce();
  });
});

function createComponent(): DetalleSolicitudPageComponent {
  TestBed.configureTestingModule({
    imports: [DetalleSolicitudPageComponent],
    providers: [
      { provide: AlertService, useValue: alerts },
      { provide: ActivatedRoute, useValue: { paramMap: of(new Map()) } },
      { provide: SolicitudDetalleStore, useValue: {} },
    ],
  });
  TestBed.overrideComponent(DetalleSolicitudPageComponent, { set: { template: '' } });

  return TestBed.createComponent(DetalleSolicitudPageComponent).componentInstance;
}
