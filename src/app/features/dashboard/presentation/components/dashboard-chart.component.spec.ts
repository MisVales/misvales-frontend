import { describe, expect, it } from 'vitest';
import { chartGeometry } from './dashboard-chart.component';

describe('chartGeometry', () => {
  it('conserva una gráfica vacía sin puntos', () => {
    expect(chartGeometry([])).toEqual({ line: '', area: '' });
  });

  it('admite movimientos positivos y negativos sin salir del lienzo', () => {
    const geometry = chartGeometry([
      { label: 'ene', value: -5 },
      { label: 'feb', value: 10 },
      { label: 'mar', value: 0 },
    ]);

    expect(geometry.line.split(' ')).toHaveLength(3);
    expect(geometry.area).toContain('600,135');
  });
});
