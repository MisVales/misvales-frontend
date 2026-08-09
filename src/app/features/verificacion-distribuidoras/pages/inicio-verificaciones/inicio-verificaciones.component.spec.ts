import { describe, expect, it } from 'vitest';
import { rutaInicialM05 } from './inicio-verificaciones.component';

describe('ruta inicial de M05', () => {
  it('envía al verificador a sus visitas asignadas', () => {
    expect(rutaInicialM05(['verification.visits.view'])).toEqual([
      '/verificacion-distribuidoras/verificaciones/asignadas',
    ]);
  });

  it('envía evaluación y autorización a la revisión de expedientes', () => {
    expect(rutaInicialM05(['verification.authorizations.decide'])).toEqual([
      '/verificacion-distribuidoras/solicitudes-distribuidora/revision',
    ]);
  });

  it('falla cerrado cuando no hay capacidades de M05', () => {
    expect(rutaInicialM05([])).toEqual(['/inicio']);
  });
});
