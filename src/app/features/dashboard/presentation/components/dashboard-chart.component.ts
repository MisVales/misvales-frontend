import { ChangeDetectionStrategy, Component, Input, computed, input } from '@angular/core';
import type { DashboardChartPoint } from '../../dashboard.models';

@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  template: `<div class="chart" [attr.aria-label]="accessibleLabel" role="img">
    <svg viewBox="0 0 600 150" aria-hidden="true" preserveAspectRatio="none">
      <line x1="0" y1="135" x2="600" y2="135" />
      <line x1="0" y1="75" x2="600" y2="75" />
      <line x1="0" y1="15" x2="600" y2="15" />
      @if (geometry().area) {
        <polygon [attr.points]="geometry().area" />
      }
      @if (geometry().line) {
        <polyline [attr.points]="geometry().line" />
      }
    </svg>
    <div class="labels">
      @for (point of points(); track point.label) {
        <span>{{ point.label }}</span>
      }
    </div>
  </div>`,
  styles: `
    .chart {
      min-width: 0;
      padding: 0.4rem 1rem 1rem;
    }
    svg {
      width: 100%;
      height: 9rem;
      overflow: visible;
    }
    line {
      stroke: var(--mv-border);
      stroke-width: 1;
    }
    polygon {
      fill: rgb(18 168 90 / 9%);
    }
    polyline {
      fill: none;
      stroke: var(--mv-primary-500);
      stroke-width: 3;
      vector-effect: non-scaling-stroke;
    }
    .labels {
      display: grid;
      grid-template-columns: repeat(var(--count, 6), minmax(0, 1fr));
      gap: 0.25rem;
      color: var(--mv-text-muted);
      font-size: 0.62rem;
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardChartComponent {
  readonly points = input<readonly DashboardChartPoint[]>([]);
  @Input() accessibleLabel = 'Gráfica de tendencia';
  readonly geometry = computed(() => chartGeometry(this.points()));
}

export function chartGeometry(points: readonly DashboardChartPoint[]): {
  line: string;
  area: string;
} {
  if (!points.length) return { line: '', area: '' };
  const width = 600,
    top = 15,
    bottom = 135;
  const values = points.map((point) => point.value);
  const min = Math.min(0, ...values),
    max = Math.max(1, ...values),
    range = Math.max(1, max - min);
  const coordinates = values.map((value, index) => {
    const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
    const y = bottom - ((value - min) / range) * (bottom - top);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return {
    line: coordinates.join(' '),
    area: `0,${bottom} ${coordinates.join(' ')} ${width},${bottom}`,
  };
}
