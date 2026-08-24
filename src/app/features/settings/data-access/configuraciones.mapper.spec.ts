import { describe, expect, it } from 'vitest';
import { ConfiguracionesMapper } from './configuraciones.mapper';
import { ConfigurationDefinitionDto, ConfigurationVersionDto } from './configuraciones.dtos';

const version: ConfigurationVersionDto = {
  id: 'v1',
  configuration_definition_id: 'd1',
  version: 1,
  value: {
    name: 'Banco configurado',
    beneficiary: 'MisVales',
    agreement: 'CONV-1',
    clabe: '012345678901234567',
  },
  status: 'PUBLISHED',
  effective_from: '2026-08-14T00:00:00Z',
  effective_to: null,
  reason: 'Publicación inicial',
  created_by: 'u1',
  published_by: 'u2',
  published_at: '2026-08-14T00:00:00Z',
  created_at: '2026-08-13T00:00:00Z',
  lock_version: 2,
};

describe('ConfiguracionesMapper', () => {
  it('conserva el contrato real y obtiene el valor vigente cargado por el servidor', () => {
    const definition: ConfigurationDefinitionDto = {
      id: 'd1',
      key: 'RELATION_PAYMENT_BANK',
      name: 'Datos bancarios para relaciones',
      description: 'Datos bancarios publicados',
      value_type: 'JSON',
      unit: null,
      is_required: true,
      is_sensitive: false,
      status: 'ACTIVE',
      lock_version: 0,
      versions: [version],
    };

    expect(ConfiguracionesMapper.fromDefinitionDto(definition)).toMatchObject({
      id: 'd1',
      clave: 'RELATION_PAYMENT_BANK',
      tipoValor: 'JSON',
      valorActual: {
        name: 'Banco configurado',
        beneficiary: 'MisVales',
        agreement: 'CONV-1',
        clabe: '012345678901234567',
      },
    });
  });

  it('mapea effective_to, actor y lock_version sin nombres de campos ficticios', () => {
    expect(ConfiguracionesMapper.fromVersionDto(version)).toMatchObject({
      definicionId: 'd1',
      numero: 1,
      finVigencia: null,
      usuarioResponsable: 'u2',
      versionRegistro: 2,
    });
  });
});
