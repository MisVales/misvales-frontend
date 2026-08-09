import { describe, expect, it } from 'vitest';
import { SolicitudDistribuidoraResponseDto } from '../dtos/verificacion-distribuidoras.dtos';
import { mapSolicitudToModel } from './verificacion-distribuidoras.mappers';

function solicitud(decision: 'AUTORIZADA' | 'RECHAZADA'): SolicitudDistribuidoraResponseDto {
  return {
    id: 'solicitud-1',
    folio: null,
    aspirante: {
      nombre_completo: 'Persona solicitante',
      curp_enmascarado: 'XXXX',
      rfc_enmascarado: 'XXXX',
    },
    sucursal: { id: 'sucursal-1', nombre: 'Sucursal' },
    coordinador_id: 'coordinador-1',
    estado: decision,
    fecha_envio: '2026-08-09T00:00:00Z',
    avance: 100,
    datos_declarados: { residences: [{ city: 'Ciudad' }] },
    visitas: [],
    correcciones: [],
    evaluacion: null,
    autorizacion: {
      id: 'autorizacion-1',
      gerente_id: 'gerente-1',
      decision,
      motivo: 'Decisión documentada',
      fecha_autorizacion: '2026-08-09T01:00:00Z',
    },
    lock_version: 8,
  };
}

describe('mapeo del expediente M05', () => {
  it.each(['AUTORIZADA', 'RECHAZADA'] as const)(
    'conserva la decisión formal %s sin datos operativos de M06',
    (decision) => {
      const model = mapSolicitudToModel(solicitud(decision));

      expect(model.estado).toBe(decision);
      expect(model.autorizacion?.decision).toBe(decision);
      expect(model.datosDeclarados).toEqual({ residences: [{ city: 'Ciudad' }] });
      expect(model.autorizacion).not.toHaveProperty('lineaInicial');
      expect(model).not.toHaveProperty('distribuidora');
    },
  );
});
