import { SolicitudDistribuidoraMapper } from './solicitud-distribuidora.mapper';

describe('SolicitudDistribuidoraMapper', () => {
  it('mapea las diez declaraciones con las claves exactas del backend', () => {
    const states = {
      personal_data: 'COMPLETED', residence: 'COMPLETED', partner: 'NOT_APPLICABLE',
      children: 'NOT_APPLICABLE', family_references: 'COMPLETED', vehicles: 'PENDING',
      assets: 'PENDING', liabilities: 'PENDING', employment: 'PENDING',
      commercial_credits: 'PENDING',
    } as const;

    const result = SolicitudDistribuidoraMapper.mapToModel({
      id: 'a1', application_number: 'SOL-1', status: 'DRAFT', applicant: null,
      section_declarations: states,
      completion: { completed_sections: 5, total_sections: 10, can_submit: false },
      lock_version: 1, submitted_at: null, created_at: '', updated_at: '',
    });

    expect(result.declaracionesSeccion).toEqual({
      datosPersonales: 'COMPLETED', domicilios: 'COMPLETED', pareja: 'NOT_APPLICABLE',
      hijos: 'NOT_APPLICABLE', referenciasFamiliares: 'COMPLETED', vehiculos: 'PENDING',
      bienes: 'PENDING', pasivos: 'PENDING', empleos: 'PENDING', creditosComerciales: 'PENDING',
    });
  });
});
