import type { RoleCode } from '@core/config/experience/experience.models';
import type { StatusBadgeTone } from '@shared/components/badges/semantic-status-badge/status-badge.component';

export type DashboardExperience = 'desktop' | 'tablet' | 'mobile';
export type DashboardTone = StatusBadgeTone;
export type DashboardSectionKind = 'list' | 'table' | 'summary' | 'chart';
export type DashboardSectionCategory = 'report' | 'activity' | 'pending' | 'alert' | 'summary';

export interface DashboardKpi {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
  readonly icon: string;
  readonly tone: DashboardTone;
  readonly secondary?: string;
  readonly route?: string;
}

export interface DashboardQuickAction {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly icon: string;
  readonly route: string;
}

export interface DashboardListItem {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly meta?: string;
  readonly icon: string;
  readonly tone: DashboardTone;
  readonly status?: string;
  readonly route?: string;
}

export interface DashboardSummaryItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
  readonly tone?: DashboardTone;
}

export interface DashboardTableColumn {
  readonly key: string;
  readonly label: string;
  readonly align?: 'start' | 'end';
}

export interface DashboardTableRow {
  readonly id: string;
  readonly cells: Readonly<Record<string, string>>;
  readonly status?: { readonly key: string; readonly label: string; readonly tone: DashboardTone };
  readonly route?: string;
}

export interface DashboardChartPoint {
  readonly label: string;
  readonly value: number;
}

export interface DashboardSection {
  readonly id: string;
  readonly kind: DashboardSectionKind;
  readonly category: DashboardSectionCategory;
  readonly title: string;
  readonly description?: string;
  readonly icon: string;
  readonly route?: string;
  readonly routeLabel?: string;
  readonly emptyMessage: string;
  readonly items?: readonly DashboardListItem[];
  readonly summary?: readonly DashboardSummaryItem[];
  readonly columns?: readonly DashboardTableColumn[];
  readonly rows?: readonly DashboardTableRow[];
  readonly chart?: readonly DashboardChartPoint[];
  readonly chartValueLabel?: string;
  readonly span?: 'wide' | 'standard';
}

export interface DashboardRoleConfig {
  readonly role: RoleCode;
  readonly experience: DashboardExperience;
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly showKpis: boolean;
  readonly showQuickActions: boolean;
  readonly showReports: boolean;
  readonly showRecentActivity: boolean;
  readonly showPendingItems: boolean;
  readonly showAlerts: boolean;
  readonly quickActionIds: readonly string[];
  readonly sectionOrder: readonly string[];
}

export interface DashboardData {
  readonly kpis: readonly DashboardKpi[];
  readonly sections: readonly DashboardSection[];
  readonly generatedAt?: string;
}
