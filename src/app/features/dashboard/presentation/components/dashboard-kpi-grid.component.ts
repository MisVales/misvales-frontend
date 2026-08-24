import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { DashboardExperience, DashboardKpi } from '../../dashboard.models';
import { DashboardKpiCardComponent } from './dashboard-kpi-card.component';

@Component({
  selector: 'app-dashboard-kpi-grid',
  standalone: true,
  imports: [DashboardKpiCardComponent],
  template: `<section
    class="grid"
    [attr.data-experience]="experience"
    aria-label="Indicadores principales"
  >
    @for (item of items; track item.id) {
      <app-dashboard-kpi-card [item]="item" />
    }
  </section>`,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 0.85rem;
    }
    .grid[data-experience='tablet'] {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .grid[data-experience='mobile'] {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.6rem;
    }
    @media (max-width: 900px) {
      .grid:not([data-experience='mobile']) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .grid[data-experience='tablet'] {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardKpiGridComponent {
  @Input() items: readonly DashboardKpi[] = [];
  @Input() experience: DashboardExperience = 'desktop';
}
