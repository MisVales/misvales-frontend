export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'maintenance';
export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success' | 'security' | 'neutral';

export interface ExecutiveMetric {
  readonly id: string;
  readonly icon: string;
  readonly label: string;
  readonly value: string | number;
  readonly description?: string;
  readonly badge?: string;
  readonly tone?: 'green' | 'orange' | 'blue' | 'red' | 'purple' | 'gray';
}

export interface NavigationItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly badge?: number;
}

export interface NavigationGroup {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly items: readonly NavigationItem[];
}

export interface GlobalAlert {
  readonly id: string;
  readonly icon: string;
  readonly message: string;
  readonly count?: number;
  readonly severity: AlertSeverity;
  readonly timestamp?: string;
}

export interface FinancialMetric {
  readonly id: string;
  readonly icon: string;
  readonly label: string;
  readonly value: string;
}
