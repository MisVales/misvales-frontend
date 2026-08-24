import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  RefactorSelectComponent,
  RefactorSelectOption,
} from '@shared/components/inputs/refactor-select/refactor-select.component';
import {
  DetailGridComponent,
  ReadOnlyDataTableComponent,
} from '@features/verifications/presentation/components/data/verification-data';
import {
  PageContextHeaderComponent,
  SectionCardComponent,
} from '@features/verifications/presentation/components/primitives/verification-primitives';
import {
  DetailItem,
  TableColumn,
} from '@features/verifications/presentation/models/verification.models';
import {
  AdminSidebarComponent,
  AlertListComponent,
  ExecutiveMetricCardComponent,
  MetricSummaryItemComponent,
  SystemHealthCardComponent,
} from '@features/dashboard/presentation/components/executive-components';
import {
  EXECUTIVE_METRICS,
  FINANCIAL_METRICS,
  GLOBAL_ALERTS,
  NAVIGATION_GROUPS,
} from '../../fixtures/executive/executive.mocks';

@Component({
  selector: 'gg-executive-gallery',
  standalone: true,
  imports: [
    FormsModule,
    LucideAngularModule,
    RefactorSelectComponent,
    DetailGridComponent,
    ReadOnlyDataTableComponent,
    PageContextHeaderComponent,
    SectionCardComponent,
    AdminSidebarComponent,
    AlertListComponent,
    ExecutiveMetricCardComponent,
    MetricSummaryItemComponent,
    SystemHealthCardComponent,
  ],
  templateUrl: './executive-gallery.component.html',
  styleUrls: [
    '../../../dashboard/presentation/styles/gerente-general-tokens.css',
    './executive-gallery.component.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutiveGalleryComponent {
  protected readonly metrics = EXECUTIVE_METRICS;
  protected readonly navigation = NAVIGATION_GROUPS;
  protected readonly alerts = GLOBAL_ALERTS;
  protected readonly financialMetrics = FINANCIAL_METRICS;
  protected period = 'month';
  protected readonly periods: readonly RefactorSelectOption[] = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Este trimestre' },
    { value: 'year', label: 'Este año' },
  ];
  protected readonly branchColumns: readonly TableColumn[] = [
    { key: 'branch', label: 'Sucursal' },
    { key: 'manager', label: 'Gerente' },
    { key: 'active', label: 'Distribuidoras activas' },
    { key: 'status', label: 'Estado operativo' },
    { key: 'alerts', label: 'Alertas' },
  ];
  protected readonly branchRows: readonly Record<string, string | number>[] = [
    { branch: 'Centro', manager: 'Laura Méndez', active: 43, status: 'Óptimo', alerts: 1 },
    { branch: 'Sur', manager: 'Ana Beltrán', active: 31, status: 'Atención', alerts: 2 },
    { branch: 'Oriente', manager: 'Roberto Díaz', active: 24, status: 'Riesgo', alerts: 3 },
  ];
  protected readonly configuration: readonly DetailItem[] = [
    { label: 'Día de corte', value: 'Día 22 de cada mes' },
    { label: 'Días posteriores al corte', value: '3 días' },
    { label: 'Recargo por mora', value: '3.00% mensual' },
    { label: 'Valor del punto', value: '$0.85' },
    { label: 'Versión del sistema', value: 'v2.5.8' },
  ];
}
