import { describe, expect, it } from 'vitest';
import { presentarRegistrosDeclarados } from './datos-declarados.presenter';

describe('presentarRegistrosDeclarados', () => {
  it('convierte un objeto técnico en campos legibles', () => {
    expect(presentarRegistrosDeclarados({
      id: 'interno',
      first_name: 'Carla',
      is_current: true,
      details_payload: null,
    })).toEqual([[
      { etiqueta: 'Nombre(s)', valor: 'Carla' },
      { etiqueta: 'Vigente', valor: 'Sí' },
    ]]);
  });

  it('presenta colecciones como registros independientes y formatea importes', () => {
    expect(presentarRegistrosDeclarados([
      { company_name: 'Tienda B QA', credit_limit: '12000.0000' },
      { company_name: 'Tienda C QA', credit_limit: null },
    ])).toEqual([
      [
        { etiqueta: 'Empresa', valor: 'Tienda B QA' },
        { etiqueta: 'Límite de crédito', valor: '$12,000.00' },
      ],
      [
        { etiqueta: 'Empresa', valor: 'Tienda C QA' },
        { etiqueta: 'Límite de crédito', valor: 'Sin dato' },
      ],
    ]);
  });

  it('usa las etiquetas de catálogo ya publicadas por los formularios', () => {
    expect(presentarRegistrosDeclarados({ ownership_status: 'OWNED' }))
      .toEqual([[{ etiqueta: 'Propiedad', valor: 'Propio' }]]);
  });
});
