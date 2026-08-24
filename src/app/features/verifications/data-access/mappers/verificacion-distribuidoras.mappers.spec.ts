import { describe, expect, it } from 'vitest';
import { mapEvaluacionToModel } from './verificacion-distribuidoras.mappers';

describe('mapEvaluacionToModel', () => {
  it('conserva el dictamen favorable entregado por la API', () => {
    const evaluacion = mapEvaluacionToModel({
      id: 'evaluation-1',
      coordinador_id: 'coordinator-1',
      dictamen: 'COMPLIES',
      motivo: 'Expediente validado.',
      fecha_evaluacion: '2026-08-19T11:12:16Z',
    });

    expect(evaluacion.dictamen).toBe('COMPLIES');
    expect(evaluacion.coordinadorId).toBe('coordinator-1');
  });
});
