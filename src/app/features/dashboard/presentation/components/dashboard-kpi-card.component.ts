import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import type { DashboardKpi } from '../../dashboard.models';

@Component({
  selector: 'app-dashboard-kpi-card',
  standalone: true,
  imports: [LucideAngularModule, RouterLink],
  template: ` <article class="kpi" [attr.data-tone]="item.tone">
    <span class="kpi__icon" aria-hidden="true"><lucide-icon [name]="item.icon" [size]="22" /></span>
    <div class="kpi__copy">
      <p>{{ item.label }}</p>
      <div>
        <strong>{{ item.value }}</strong>
        @if (item.unit) {
          <span>{{ item.unit }}</span>
        }
      </div>
      @if (item.secondary) {
        <small>{{ item.secondary }}</small>
      }
    </div>
    @if (item.route) {
      <a [routerLink]="item.route" [attr.aria-label]="'Ver ' + item.label"
        ><lucide-icon name="chevron-right" [size]="17"
      /></a>
    }
  </article>`,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .kpi {
      --tone: var(--mv-primary-600);
      --soft: var(--mv-primary-50);
      position: relative;
      min-height: 7.7rem;
      display: grid;
      grid-template-columns: 2.75rem minmax(0, 1fr);
      align-items: center;
      gap: 0.8rem;
      padding: 1rem;
      border: 1px solid var(--mv-border);
      border-radius: var(--mv-radius-lg);
      background: var(--mv-surface);
      box-shadow: var(--mv-shadow-card);
    }
    .kpi[data-tone='blue'] {
      --tone: var(--mv-info);
      --soft: #edf5ff;
    }
    .kpi[data-tone='orange'] {
      --tone: var(--mv-warning);
      --soft: #fff7ed;
    }
    .kpi[data-tone='red'] {
      --tone: var(--mv-danger);
      --soft: #fff1f0;
    }
    .kpi[data-tone='purple'] {
      --tone: #7c3eb4;
      --soft: #f7effd;
    }
    .kpi[data-tone='gray'] {
      --tone: #526174;
      --soft: #f2f5f3;
    }
    .kpi__icon {
      width: 2.75rem;
      height: 2.75rem;
      display: grid;
      place-items: center;
      border-radius: 0.85rem;
      color: var(--tone);
      background: var(--soft);
    }
    .kpi__copy {
      min-width: 0;
      display: grid;
      gap: 0.25rem;
    }
    p,
    small {
      margin: 0;
    }
    p {
      color: var(--mv-text-muted);
      font-size: 0.74rem;
      font-weight: 700;
      line-height: 1.3;
    }
    .kpi__copy div {
      min-width: 0;
      display: flex;
      align-items: baseline;
      gap: 0.32rem;
    }
    strong {
      overflow: hidden;
      font-size: clamp(1.15rem, 2vw, 1.65rem);
      line-height: 1.1;
      letter-spacing: -0.035em;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .kpi__copy div span {
      color: var(--mv-text-muted);
      font-size: 0.72rem;
      font-weight: 700;
    }
    small {
      overflow: hidden;
      color: var(--tone);
      font-size: 0.68rem;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    a {
      position: absolute;
      top: 0.55rem;
      right: 0.55rem;
      width: 2.75rem;
      height: 2.75rem;
      display: grid;
      place-items: center;
      border-radius: 0.7rem;
      color: var(--mv-text-muted);
    }
    a:hover {
      color: var(--tone);
      background: var(--soft);
    }
    @media (max-width: 680px) {
      .kpi {
        min-height: 6.25rem;
        grid-template-columns: 2.25rem minmax(0, 1fr);
        gap: 0.55rem;
        padding: 0.8rem;
      }
      .kpi__icon {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.7rem;
      }
      strong {
        font-size: 1.05rem;
      }
      p {
        font-size: 0.68rem;
      }
      small {
        font-size: 0.62rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardKpiCardComponent {
  @Input({ required: true }) item!: DashboardKpi;
}
