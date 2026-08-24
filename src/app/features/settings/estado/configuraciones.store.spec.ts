import { describe, expect, it } from 'vitest';
import { mensajeErrorConfiguracion } from './configuraciones.store';

describe('mensajeErrorConfiguracion', () => {
  it('muestra el mensaje de la envoltura de error estándar de la API', () => {
    expect(mensajeErrorConfiguracion({
      error: {
        error: {
          code: 'CONFIGURATION_VALIDITY_OVERLAP',
          message: 'La vigencia debe ser estrictamente posterior a la versión publicada actual.',
        },
      },
    }, 'Error al publicar versión')).toBe('La vigencia debe ser estrictamente posterior a la versión publicada actual.');
  });
});
