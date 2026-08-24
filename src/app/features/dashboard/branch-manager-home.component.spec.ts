import { describe, expect, it } from 'vitest';
import { chartGeometry } from './branch-manager-home.component';

describe('chartGeometry', () => {
  it('genera una tendencia acotada sin dividir entre cero', () => {
    const chart = chartGeometry([{ points: 0 }, { points: 12 }, { points: 6 }]);

    expect(chart.max).toBe(12);
    expect(chart.points.split(' ')).toHaveLength(3);
    expect(chart.area).toContain('560,118');
  });

  it('mantiene una gráfica vacía cuando no hay movimientos', () => {
    expect(chartGeometry([])).toEqual({ points: '', area: '', max: 1 });
  });
});
