import { describe, expect, it } from 'vitest';
import { AlertService } from './alert.service';

describe('AlertService', () => {
  it('publica un aviso de éxito reutilizable', () => {
    const service = new AlertService();

    service.success('La sucursal se creó correctamente.', 0);

    expect(service.alerts()).toHaveLength(1);
    expect(service.alerts()[0]).toMatchObject({
      type: 'success',
      message: 'La sucursal se creó correctamente.',
      duration: 0,
    });
  });

  it('descarta avisos vacíos y normaliza mensajes de error', () => {
    const service = new AlertService();

    service.warning('   ', 0);
    service.showAlert({ error: { message: '  Revisa los datos capturados.  ' } }, 'warning', 0);

    expect(service.alerts()).toHaveLength(1);
    expect(service.alerts()[0].message).toBe('Revisa los datos capturados.');
  });
});
