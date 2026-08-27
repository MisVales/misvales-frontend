import { describe, expect, it } from 'vitest';
import { esHorarioDeVerificacion } from './configuraciones-visibilidad';

describe('configuraciones de horarios de verificación', () => {
  it('identifica las horas mínima y máxima como configuraciones del módulo', () => {
    expect(esHorarioDeVerificacion('VERIFICATION_START_TIME')).toBe(true);
    expect(esHorarioDeVerificacion('VERIFICATION_MAX_START_TIME')).toBe(true);
    expect(esHorarioDeVerificacion('CUT_TIME')).toBe(false);
  });
});
