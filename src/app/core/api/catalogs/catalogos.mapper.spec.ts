import { AbstractControl } from '@angular/forms';
import { CatalogosMapper } from './catalogos.mapper';
import { CategoriaRes, EstadoVersionApi } from '../models/catalogos.dtos';

function multiploDeCienValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = control.value;
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return { notNumber: true };
  if (num % 100 !== 0) return { notMultiple100: true };
  return null;
}

describe('Catalogos Validations and Mappers', () => {
  it('should validate multiplo de 100', () => {
    expect(multiploDeCienValidator({ value: '100' } as any)).toBeNull();
    expect(multiploDeCienValidator({ value: '150' } as any)).toEqual({ notMultiple100: true });
    expect(multiploDeCienValidator({ value: '200' } as any)).toBeNull();
    expect(multiploDeCienValidator({ value: '100.5' } as any)).toEqual({ notMultiple100: true });
  });

  it('should map CategoriaRes to Model', () => {
    const res: CategoriaRes = {
      id: '1',
      nombre: 'Test',
      descripcion: 'Desc',
      porcentajeGanancia: '15.5',
      estado: 'BORRADOR',
      inicioVigencia: '2026-08-01T00:00:00Z',
      motivo: 'Init',
      version: 1
    };

    const model = CatalogosMapper.mapCategoriaResToModel(res);
    expect(model.porcentajeGanancia).toBe('15.5');
    expect(model.inicioVigencia.getFullYear()).toBe(2026);
  });
});
