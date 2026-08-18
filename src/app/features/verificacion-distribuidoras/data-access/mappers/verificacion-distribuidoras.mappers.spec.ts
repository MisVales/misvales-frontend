import { mapSolicitudToModel } from './verificacion-distribuidoras.mappers';

describe('mapSolicitudToModel', () => {
  it('convierte el objeto de avance del backend en porcentaje', () => {
    const result = mapSolicitudToModel({
      id: 'a1', application_number: 'SOL-1', status: 'COORDINATOR_REVIEW',
      applicant: { full_name: 'Alicia QA', curp_masked: 'PUMA********FRRL08' },
      branch: { id: 'b1', name: 'Matriz' }, coordinator: { id: 'u1', name: 'Coord' },
      submitted_at: '2026-08-14T00:00:00Z',
      completion: { completed_sections: 8, total_sections: 10, can_submit: false },
      lock_version: 3,
    });

    expect(result.avance).toBe(80);
  });

  it('conserva identificadores enmascarados y descarta sus valores completos', () => {
    const result = mapSolicitudToModel({
      id: 'a1', application_number: 'SOL-1', status: 'COORDINATOR_REVIEW',
      applicant: { full_name: 'Alicia QA', curp_masked: 'PUMA********FRRL08' },
      branch: { id: 'b1', name: 'Matriz' }, coordinator: { id: 'u1', name: 'Coord' },
      submitted_at: '2026-08-14T00:00:00Z', completion: 100, lock_version: 3,
      personal_data: {
        curp: 'CURP_COMPLETA', curp_masked: 'CURP********TA',
        rfc: 'RFC_COMPLETO', rfc_masked: 'RFC******TO',
        official_id_number: 'ID_COMPLETO', official_id_number_masked: 'ID****TO',
      },
    });

    expect(result.aspirante.rfcEnmascarado).toBe('RFC******TO');
    expect(result.datosDeclarados['personal_data']).toEqual({
      curp_masked: 'CURP********TA',
      rfc_masked: 'RFC******TO',
      official_id_number_masked: 'ID****TO',
    });
  });
});
