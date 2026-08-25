import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { StatusBadgeComponent } from '@shared/components/badges/semantic-status-badge/status-badge.component';
import type { DashboardExperience, DashboardSection } from '../../dashboard.models';
import { DashboardChartComponent } from './dashboard-chart.component';

@Component({
  selector: 'app-dashboard-section',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    LucideAngularModule,
    RouterLink,
    StatusBadgeComponent,
    DashboardChartComponent,
  ],
  template: `<section
    class="panel"
    [attr.data-kind]="section.kind"
    [attr.data-experience]="experience"
    [attr.aria-labelledby]="section.id + '-title'"
  >
    <header>
      <div>
        <span aria-hidden="true"><lucide-icon [name]="section.icon" [size]="18" /></span>
        <div>
          <h2 [id]="section.id + '-title'">{{ section.title }}</h2>
          @if (section.description) {
            <p>{{ section.description }}</p>
          }
        </div>
      </div>
      @if (section.route) {
        <a [routerLink]="section.route"
          >{{ section.routeLabel || 'Ver todos' }}<lucide-icon name="chevron-right" [size]="15"
        /></a>
      }
    </header>
    @switch (section.kind) {
      @case ('list') {
        <div class="item-list">
          @for (item of section.items || []; track item.id) {
            @if (item.route) {
              <a class="item" [routerLink]="item.route"
                ><ng-container
                  [ngTemplateOutlet]="itemBody"
                  [ngTemplateOutletContext]="{ $implicit: item }"
              /></a>
            } @else {
              <div class="item">
                <ng-container
                  [ngTemplateOutlet]="itemBody"
                  [ngTemplateOutletContext]="{ $implicit: item }"
                />
              </div>
            }
          } @empty {
            <p class="empty">{{ section.emptyMessage }}</p>
          }
        </div>
      }
      @case ('summary') {
        <dl class="summary-grid">
          @for (item of section.summary || []; track item.id) {
            <div [attr.data-tone]="item.tone || 'gray'">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
              @if (item.hint) {
                <small>{{ item.hint }}</small>
              }
            </div>
          } @empty {
            <p class="empty">{{ section.emptyMessage }}</p>
          }
        </dl>
      }
      @case ('table') {
        @if ((section.rows || []).length) {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  @for (column of section.columns || []; track column.key) {
                    <th [class.numeric]="column.align === 'end'">{{ column.label }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of section.rows || []; track row.id) {
                  <tr>
                    @for (column of section.columns || []; track column.key; let first = $first) {
                      <td [attr.data-label]="column.label" [class.numeric]="column.align === 'end'">
                        @if (row.status?.key === column.key) {
                          <refactor-status-badge
                            [label]="row.status!.label"
                            [tone]="row.status!.tone"
                          />
                        } @else if (first && row.route) {
                          <a class="table-link" [routerLink]="row.route">{{
                            row.cells[column.key] || 'Sin dato'
                          }}</a>
                        } @else {
                          {{ row.cells[column.key] || 'Sin dato' }}
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p class="empty">{{ section.emptyMessage }}</p>
        }
      }
      @case ('chart') {
        @if ((section.chart || []).length) {
          <app-dashboard-chart
            [points]="section.chart || []"
            [accessibleLabel]="section.chartValueLabel || section.title"
          />
        } @else {
          <p class="empty">{{ section.emptyMessage }}</p>
        }
      }
    }
    <ng-template #itemBody let-item>
      <span class="item__icon" [attr.data-tone]="item.tone" aria-hidden="true"
        ><lucide-icon [name]="item.icon" [size]="19"
      /></span>
      <span class="item__copy"
        ><strong>{{ item.title }}</strong>
        @if (item.subtitle) {
          <small>{{ item.subtitle }}</small>
        }
      </span>
      @if (item.status) {
        <refactor-status-badge [label]="item.status" [tone]="item.tone" />
      }
      @if (item.meta) {
        <span class="item__meta">{{ item.meta }}</span>
      }
      @if (item.route) {
        <lucide-icon class="item__chevron" name="chevron-right" [size]="16" aria-hidden="true" />
      }
    </ng-template>
  </section>`,
  styles: `
    :host {
      display: block;
      height: 100%;
      min-width: 0;
    }
    .panel {
      height: 100%;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-sizing: border-box;
      border: 1px solid var(--mv-border);
      border-radius: var(--mv-radius-lg);
      background: var(--mv-surface);
      box-shadow: var(--mv-shadow-card);
    }
    header {
      min-height: 3.4rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--mv-border);
    }
    header > div {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    header > div > span {
      color: var(--mv-primary-600);
    }
    h2,
    p {
      margin: 0;
    }
    h2 {
      font-size: 0.9rem;
    }
    header p {
      margin-top: 0.12rem;
      color: var(--mv-text-muted);
      font-size: 0.68rem;
    }
    header a {
      min-height: 2.75rem;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--mv-info);
      font-size: 0.72rem;
      font-weight: 750;
      text-decoration: none;
      white-space: nowrap;
    }
    .item-list {
      display: grid;
    }
    .item {
      min-width: 0;
      min-height: 3.9rem;
      display: grid;
      grid-template-columns: 2.25rem minmax(0, 1fr) auto auto auto;
      align-items: center;
      gap: 0.65rem;
      padding: 0.6rem 1rem;
      border-bottom: 1px solid var(--mv-border);
      color: var(--mv-text);
      text-decoration: none;
    }
    .item:last-child {
      border-bottom: 0;
    }
    .item:hover {
      background: var(--mv-surface-muted);
    }
    .item__icon {
      --tone: #526174;
      --soft: #f2f5f3;
      width: 2.25rem;
      height: 2.25rem;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: var(--tone);
      background: var(--soft);
    }
    .item__icon[data-tone='green'] {
      --tone: var(--mv-primary-600);
      --soft: var(--mv-primary-50);
    }
    .item__icon[data-tone='blue'] {
      --tone: var(--mv-info);
      --soft: #edf5ff;
    }
    .item__icon[data-tone='orange'] {
      --tone: var(--mv-warning);
      --soft: #fff7ed;
    }
    .item__icon[data-tone='red'] {
      --tone: var(--mv-danger);
      --soft: #fff1f0;
    }
    .item__icon[data-tone='purple'] {
      --tone: #7c3eb4;
      --soft: #f7effd;
    }
    .item__copy {
      min-width: 0;
      display: grid;
      gap: 0.12rem;
    }
    .item__copy strong,
    .item__copy small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .item__copy strong {
      font-size: 0.77rem;
    }
    .item__copy small,
    .item__meta {
      color: var(--mv-text-muted);
      font-size: 0.66rem;
    }
    .item__meta {
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .item__chevron {
      color: var(--mv-text-muted);
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
      margin: 0;
      padding: 0.85rem;
      gap: 0.65rem;
    }
    .summary-grid > div {
      min-width: 0;
      padding: 0.8rem;
      border: 1px solid var(--mv-border);
      border-radius: var(--mv-radius-md);
      background: var(--mv-surface-muted);
    }
    dt {
      color: var(--mv-text-muted);
      font-size: 0.68rem;
    }
    dd {
      margin: 0.25rem 0 0;
      font-size: 1.12rem;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }
    .summary-grid small {
      display: block;
      margin-top: 0.2rem;
      color: var(--mv-text-muted);
      font-size: 0.62rem;
    }
    .table-wrap {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.7rem;
    }
    th,
    td {
      padding: 0.65rem 0.9rem;
      border-bottom: 1px solid var(--mv-border);
      text-align: left;
      white-space: nowrap;
    }
    th {
      color: var(--mv-text-muted);
      font-size: 0.64rem;
    }
    .table-link {
      color: var(--mv-info);
      font-weight: 750;
      text-decoration: none;
    }
    .table-link:hover {
      text-decoration: underline;
    }
    tbody tr:last-child td {
      border-bottom: 0;
    }
    .numeric {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .empty {
      min-height: 7rem;
      display: grid;
      place-items: center;
      padding: 1rem;
      color: var(--mv-text-muted);
      font-size: 0.75rem;
      text-align: center;
    }
    @media (max-width: 680px) {
      header {
        min-height: 3rem;
        padding: 0.6rem 0.75rem;
      }
      .item {
        grid-template-columns: 2.15rem minmax(0, 1fr) auto auto;
        padding: 0.55rem 0.75rem;
      }
      .item__meta {
        display: none;
      }
      .summary-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        padding: 0.65rem;
        gap: 0.5rem;
      }
      .panel[data-kind='table'] .table-wrap {
        overflow: visible;
      }
      .panel[data-kind='table'] table,
      .panel[data-kind='table'] thead,
      .panel[data-kind='table'] tbody,
      .panel[data-kind='table'] tr,
      .panel[data-kind='table'] td {
        display: block;
      }
      .panel[data-kind='table'] thead {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
      }
      .panel[data-kind='table'] tr {
        padding: 0.55rem 0.75rem;
        border-bottom: 1px solid var(--mv-border);
      }
      .panel[data-kind='table'] tr:last-child {
        border-bottom: 0;
      }
      .panel[data-kind='table'] td {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.22rem 0;
        border: 0;
        text-align: right;
        white-space: normal;
      }
      .panel[data-kind='table'] td::before {
        content: attr(data-label);
        color: var(--mv-text-muted);
        text-align: left;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSectionComponent {
  @Input({ required: true }) section!: DashboardSection;
  @Input() experience: DashboardExperience = 'desktop';
}
