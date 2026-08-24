import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { FinancialMetric } from '../models/executive.models';

const TOKENS = '../styles/gerente-general-tokens.css';

@Component({
  selector: 'gg-metric-summary-item',
  standalone: true,
  imports: [LucideAngularModule],
  styleUrls: [TOKENS],
  template: `<article class="summary">
    <lucide-icon [name]="metric.icon" [size]="18" aria-hidden="true" />
    <small>{{ metric.label }}</small>
    <strong>{{ metric.value }}</strong>
  </article>`,
  styles: [
    `
      :host {
        display: block;
      }
      .summary {
        border-right: 1px solid var(--gg-line);
        display: grid;
        gap: 7px;
        grid-template-columns: 20px 1fr;
        padding: 14px;
      }
      .summary > lucide-icon {
        color: var(--gg-green);
      }
      small {
        color: var(--gg-muted);
        font-size: 10px;
        line-height: 1.4;
      }
      strong {
        font-size: 20px;
        grid-column: 1/-1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricSummaryItemComponent {
  @Input({ required: true }) metric!: FinancialMetric;
}
