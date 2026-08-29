import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { SessionStore } from '../../../../core/session/session.store';
import { ProductosService } from '../../data-access/productos.service';
import { ProductoDetalleComponent } from './producto-detalle.component';

describe('ProductoDetalleComponent', () => {
  let fixture: ComponentFixture<ProductoDetalleComponent>;
  let component: ProductoDetalleComponent;
  const service = { crear: vi.fn() };
  const alerts = { success: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ProductoDetalleComponent],
      providers: [
        provideRouter([]),
        { provide: ProductosService, useValue: service },
        { provide: AlertService, useValue: alerts },
        { provide: SessionStore, useValue: { roles: signal(['general_manager']) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'nuevo' }) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductoDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra el error del nombre al enfocarlo vacío', () => {
    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement;
    nameInput.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El nombre es obligatorio.');
    expect(nameInput.placeholder).toBe('Ej. Vale de $5,000');
  });

  it('muestra los errores requeridos al intentar guardar', async () => {
    await (component as any).guardar();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El importe nominal es obligatorio.');
  });
});
