import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { CategoriasService } from '../../data-access/categorias.service';
import { CategoriaDetalleComponent } from './categoria-detalle.component';

describe('CategoriaDetalleComponent', () => {
  let fixture: ComponentFixture<CategoriaDetalleComponent>;
  let component: CategoriaDetalleComponent;
  const service = { crear: vi.fn().mockReturnValue({ subscribe: vi.fn() }) };
  const alerts = { success: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [CategoriaDetalleComponent],
      providers: [
        provideRouter([]),
        { provide: CategoriasService, useValue: service },
        { provide: AlertService, useValue: alerts },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CategoriaDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra el error al enfocar un campo obligatorio vacío', () => {
    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="name"]') as HTMLInputElement;
    nameInput.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El nombre es obligatorio.');
    expect(nameInput.placeholder).toBe('Ej. Categoría base');
  });

  it('muestra todos los requeridos al enviar un formulario vacío', async () => {
    await component.guardar();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El código es obligatorio.');
    expect(fixture.nativeElement.textContent).toContain('El porcentaje de ganancia es obligatorio.');
    expect(fixture.nativeElement.textContent).toContain('El motivo es obligatorio.');
  });
});
