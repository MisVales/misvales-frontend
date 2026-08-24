import { describe, expect, it } from 'vitest';
import { rutaInicialVerificaciones } from './inicio-verificaciones.component';

describe('ruta inicial de verificaciones', () => {
  it('envía al verificador a sus visitas asignadas', () => {
    expect(rutaInicialVerificaciones(['verification.visits.view'])).toEqual([
      '/verificacion-distribuidoras/verificaciones/asignadas',
    ]);
  });

  it('envía evaluación y autorización a la revisión de expedientes', () => {
    expect(rutaInicialVerificaciones(['verification.authorizations.decide'])).toEqual([
      '/verificacion-distribuidoras/solicitudes-distribuidora/revision',
    ]);
  });

  it('falla cerrado cuando no hay capacidades de verificación', () => {
    expect(rutaInicialVerificaciones([])).toEqual(['/inicio']);
  });
});
