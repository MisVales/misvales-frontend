import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import {
  StatusBadgeComponent,
  StatusBadgeTone,
} from '@shared/components/badges/semantic-status-badge/status-badge.component';
import {
  AlertSeverity,
  ExecutiveMetric,
  GlobalAlert,
  HealthStatus,
  NavigationGroup,
  NavigationItem,
} from '../models/executive.models';

export { MetricSummaryItemComponent } from './metric-summary-item.component';

const TOKENS = '../styles/gerente-general-tokens.css';

@Component({
  selector: 'gg-executive-metric-card',
  standalone: true,
  imports: [LucideAngularModule, StatusBadgeComponent],
  styleUrls: [TOKENS],
  template: `<article class="metric" [attr.data-tone]="metric.tone || 'green'">
    <span class="metric-icon" aria-hidden="true"
      ><lucide-icon [name]="metric.icon" [size]="25" [strokeWidth]="1.8"
    /></span>
    <div class="metric-copy">
      <span class="metric-label">{{ metric.label }}</span>
      <div class="metric-value-row">
        <strong>{{ metric.value }}</strong>
        @if (metric.description) {
          <span>{{ metric.description }}</span>
        }
      </div>
      @if (metric.badge) {
        <refactor-status-badge [label]="metric.badge" [tone]="badgeTone" />
      }
    </div>
  </article>`,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
      .metric {
        align-items: center;
        background: #fff;
        border: 1px solid var(--gg-line);
        border-radius: 14px;
        box-shadow: 0 5px 18px rgb(31 55 45 / 6%);
        display: grid;
        gap: 14px;
        grid-template-columns: 54px minmax(0, 1fr);
        height: 100%;
        min-height: 132px;
        padding: 18px;
      }
      .metric-icon {
        align-items: center;
        align-self: center;
        background: var(--gg-green-soft);
        border-radius: 16px;
        color: var(--gg-green);
        display: flex;
        height: 54px;
        justify-content: center;
        width: 54px;
      }
      .metric-copy {
        align-items: start;
        display: grid;
        gap: 8px;
        min-width: 0;
      }
      .metric-label {
        color: var(--gg-muted);
        font-size: 12px;
        line-height: 1.35;
      }
      .metric-value-row {
        align-items: baseline;
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }
      .metric-value-row strong {
        color: var(--gg-green);
        font-size: 28px;
        line-height: 1;
      }
      .metric-value-row span {
        color: var(--gg-muted);
        font-size: 11px;
        font-weight: 650;
      }
      [data-tone='red'] .metric-icon {
        background: #fff0f0;
        color: var(--gg-red);
      }
      [data-tone='red'] .metric-value-row strong {
        color: var(--gg-red);
      }
      @media (max-width: 430px) {
        .metric {
          grid-template-columns: 48px minmax(0, 1fr);
          min-height: 116px;
          padding: 15px;
        }
        .metric-icon {
          border-radius: 14px;
          height: 48px;
          width: 48px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutiveMetricCardComponent {
  @Input({ required: true }) metric!: ExecutiveMetric;
  get badgeTone(): StatusBadgeTone {
    return this.metric.tone === 'red' ? 'red' : 'green';
  }
}

@Component({
  selector: 'gg-system-health-card',
  standalone: true,
  imports: [LucideAngularModule],
  styleUrls: [TOKENS],
  template: `<article class="health" [attr.data-status]="status">
    <span class="health-icon"><lucide-icon [name]="icon" [size]="22" aria-hidden="true" /></span>
    <div>
      <strong>{{ title }}</strong>
      <p>{{ description }}</p>
      <small><span aria-hidden="true">●</span> {{ statusLabel }}</small>
    </div>
  </article>`,
  styles: [
    `
      .health {
        align-items: start;
        border: 1px solid var(--gg-line);
        border-radius: 13px;
        display: grid;
        gap: 11px;
        grid-template-columns: 38px 1fr;
        padding: 14px;
      }
      .health-icon {
        align-items: center;
        background: var(--gg-green-soft);
        border-radius: 50%;
        color: var(--gg-green);
        display: flex;
        height: 38px;
        justify-content: center;
      }
      .health strong {
        font-size: 12px;
      }
      .health p {
        color: var(--gg-muted);
        font-size: 11px;
        line-height: 1.5;
        margin: 5px 0;
      }
      .health small {
        color: var(--gg-green);
        font-weight: 700;
      }
      .health[data-status='warning'] small,
      .health[data-status='warning'] .health-icon {
        color: var(--gg-orange);
      }
      .health[data-status='critical'] small,
      .health[data-status='critical'] .health-icon {
        color: var(--gg-red);
      }
      .health[data-status='maintenance'] small,
      .health[data-status='maintenance'] .health-icon {
        color: var(--gg-blue);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemHealthCardComponent {
  @Input() title = 'Entorno seguro';
  @Input() description = 'Todos los sistemas operando con normalidad';
  @Input() status: HealthStatus = 'healthy';
  @Input() statusLabel = 'Sin incidencias';
  @Input() icon = 'shield-check';
}

@Component({
  selector: 'gg-admin-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, SystemHealthCardComponent],
  styleUrls: [TOKENS],
  template: `<nav
    class="sidebar"
    [class.collapsed]="collapsed"
    aria-label="Navegación administrativa"
  >
    <button
      class="home"
      type="button"
      [attr.aria-current]="activeItemId === 'home' ? 'page' : null"
      (click)="select({ id: 'home', label: 'Inicio', active: true })"
    >
      <lucide-icon name="layout-dashboard" [size]="18" /><span>Inicio</span>
    </button>
    @for (group of groups; track group.id) {
      <section>
        <h3>
          <lucide-icon [name]="group.icon" [size]="18" /><span>{{ group.label }}</span>
        </h3>
        <ul>
          @for (item of group.items; track item.id) {
            <li>
              <button
                type="button"
                [disabled]="item.disabled"
                [attr.aria-current]="activeItemId === item.id ? 'page' : null"
                (click)="select(item)"
              >
                <span aria-hidden="true">•</span><span>{{ item.label }}</span>
                @if (item.badge) {
                  <b>{{ item.badge }}</b>
                }
              </button>
            </li>
          }
        </ul>
      </section>
    }
    <gg-system-health-card /><button
      class="collapse"
      type="button"
      [attr.aria-label]="collapsed ? 'Expandir menú' : 'Colapsar menú'"
      (click)="collapseToggled.emit()"
    >
      <lucide-icon [name]="collapsed ? 'panel-left-open' : 'panel-left-close'" [size]="18" /><span
        >Colapsar menú</span
      >
    </button>
  </nav>`,
  styles: [
    `
      .sidebar {
        background: #fff;
        border: 1px solid var(--gg-line);
        border-radius: 16px;
        display: grid;
        gap: 14px;
        padding: 14px;
        width: min(100%, 250px);
      }
      button {
        border: 0;
        cursor: pointer;
      }
      .home,
      .collapse {
        align-items: center;
        background: #fff;
        border-radius: 9px;
        color: var(--gg-ink);
        display: flex;
        gap: 10px;
        min-height: 42px;
        padding: 10px;
      }
      .home[aria-current='page'] {
        background: var(--gg-green-soft);
        color: var(--gg-green);
        font-weight: 750;
      }
      section h3 {
        align-items: center;
        display: flex;
        font-size: 12px;
        gap: 9px;
        margin: 0 0 6px;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0 0 0 26px;
      }
      li button {
        align-items: center;
        background: transparent;
        color: var(--gg-muted);
        display: flex;
        font-size: 11px;
        gap: 8px;
        padding: 6px 0;
        text-align: left;
        width: 100%;
      }
      li button[aria-current='page'] {
        color: var(--gg-green);
        font-weight: 750;
      }
      li b {
        margin-left: auto;
      }
      .collapse {
        border: 1px solid var(--gg-line);
        justify-content: center;
      }
      .collapsed {
        width: 74px;
      }
      .collapsed span,
      .collapsed section,
      .collapsed gg-system-health-card {
        display: none;
      }
      .collapsed .home,
      .collapsed .collapse {
        justify-content: center;
      }
      @media (max-width: 620px) {
        .sidebar {
          width: 100%;
        }
        .collapsed {
          width: 74px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebarComponent {
  @Input() groups: readonly NavigationGroup[] = [];
  @Input() activeItemId = 'home';
  @Input() collapsed = false;
  @Output() readonly itemSelected = new EventEmitter<NavigationItem>();
  @Output() readonly collapseToggled = new EventEmitter<void>();
  protected select(item: NavigationItem): void {
    if (!item.disabled) this.itemSelected.emit(item);
  }
}

const severityTone: Record<AlertSeverity, StatusBadgeTone> = {
  critical: 'red',
  warning: 'orange',
  info: 'blue',
  success: 'green',
  security: 'purple',
  neutral: 'gray',
};
@Component({
  selector: 'gg-alert-list',
  standalone: true,
  imports: [LucideAngularModule, StatusBadgeComponent],
  styleUrls: [TOKENS],
  template: `<div class="alerts" [attr.aria-busy]="loading">
    @if (loading) {
      <p role="status">Cargando alertas…</p>
    } @else {
      @for (alert of visibleAlerts; track alert.id) {
        <button type="button" (click)="itemSelected.emit(alert)">
          <span class="alert-icon" [attr.data-severity]="alert.severity"
            ><lucide-icon [name]="alert.icon" [size]="19" /></span
          ><span class="message">{{ alert.message }}</span>
          @if (alert.count) {
            <refactor-status-badge [label]="alert.count.toString()" [tone]="tone(alert.severity)" />
          }
          <time>{{ alert.timestamp }}</time
          ><lucide-icon name="chevron-right" [size]="16" />
        </button>
      } @empty {
        <p>Sin alertas importantes.</p>
      }
    }
  </div>`,
  styles: [
    `
      .alerts {
        display: grid;
      }
      .alerts button {
        align-items: center;
        background: #fff;
        border: 0;
        border-bottom: 1px solid var(--gg-line);
        color: var(--gg-ink);
        cursor: pointer;
        display: grid;
        font: inherit;
        gap: 10px;
        grid-template-columns: 28px minmax(0, 1fr) auto 72px 18px;
        min-height: 50px;
        padding: 8px;
        text-align: left;
      }
      .alerts button:last-child {
        border-bottom: 0;
      }
      .alert-icon {
        color: var(--gg-blue);
      }
      .alert-icon[data-severity='critical'] {
        color: var(--gg-red);
      }
      .alert-icon[data-severity='warning'] {
        color: var(--gg-orange);
      }
      .alert-icon[data-severity='security'] {
        color: var(--gg-purple);
      }
      .message {
        font-size: 11px;
        font-weight: 650;
      }
      .alerts time {
        color: var(--gg-muted);
        font-size: 10px;
        text-align: right;
      }
      @media (max-width: 560px) {
        .alerts button {
          grid-template-columns: 28px 1fr auto;
        }
        .alerts time,
        .alerts button > lucide-icon {
          display: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertListComponent {
  @Input() alerts: readonly GlobalAlert[] = [];
  @Input() loading = false;
  @Input() maxItems?: number;
  @Output() readonly itemSelected = new EventEmitter<GlobalAlert>();
  get visibleAlerts(): readonly GlobalAlert[] {
    return this.maxItems ? this.alerts.slice(0, this.maxItems) : this.alerts;
  }
  protected tone(s: AlertSeverity): StatusBadgeTone {
    return severityTone[s];
  }
}
