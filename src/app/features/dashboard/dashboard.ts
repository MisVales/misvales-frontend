import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { SessionStore } from '@core/session/session.store';
import { hasEffectivePermission } from '@core/authorization/navigation.permissions';
import { effectiveNavigationItems } from '@shared/utils/navigation/effective-navigation';
import { BOTTOM_ITEMS, navigationGroupsForRoles } from '@shared/utils/navigation/navigation.config';
import { dashboardConfigForRoles } from './dashboard.config';
import { DashboardDataService } from './dashboard-data.service';
import type { DashboardData, DashboardQuickAction } from './dashboard.models';
import { DashboardKpiGridComponent } from './presentation/components/dashboard-kpi-grid.component';
import { DashboardSectionComponent } from './presentation/components/dashboard-section.component';
import { QuickActionsComponent } from './presentation/components/quick-actions.component';
import { CoordinatorHomeComponent } from './coordinator-home.component';
import { VerifierHomeComponent } from './verifier-home.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    LucideAngularModule,
    DashboardKpiGridComponent,
    DashboardSectionComponent,
    QuickActionsComponent,
    CoordinatorHomeComponent,
    VerifierHomeComponent,
  ],
  templateUrl: './dashboard.html',
  styles: `
    :host {
      display: block;
    }
    .dashboard {
      display: grid;
      gap: 1rem;
      color: var(--mv-text);
    }
    .dashboard-header {
      min-width: 0;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 0.15rem 0.25rem 0.25rem;
    }
    .dashboard-header__copy {
      min-width: 0;
    }
    .eyebrow {
      margin: 0 0 0.25rem;
      color: var(--mv-primary-700);
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      font-size: clamp(1.65rem, 2.8vw, 2.25rem);
      line-height: 1.1;
      letter-spacing: -0.04em;
    }
    .subtitle {
      max-width: 46rem;
      margin: 0.4rem 0 0;
      color: var(--mv-text-muted);
      font-size: 0.88rem;
    }
    .updated {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.35rem;
      margin: -0.35rem 0.25rem 0;
      color: var(--mv-text-muted);
      font-size: 0.64rem;
    }
    .sections {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: 1fr;
      gap: 1rem;
      align-items: stretch;
    }
    .sections > .section-wide {
      grid-column: 1 / -1;
    }
    .sections > app-dashboard-section {
      height: 100%;
      align-self: stretch;
    }
    .loading-state {
      min-height: 5.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.1rem;
      border: 1px solid var(--mv-border);
      border-radius: var(--mv-radius-lg);
      background: var(--mv-surface);
      color: var(--mv-text-muted);
    }
    .loading-state__icon {
      width: 2.5rem;
      height: 2.5rem;
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      border-radius: 50%;
      color: var(--mv-primary-700);
      background: var(--mv-primary-50);
    }
    .loading-state__icon lucide-icon {
      animation: spin 0.9s linear infinite;
    }
    .loading-state strong {
      display: block;
      color: var(--mv-text);
      font-size: 0.86rem;
    }
    .loading-state p {
      margin: 0.2rem 0 0;
      font-size: 0.75rem;
    }
    .error-state {
      min-height: 16rem;
      display: grid;
      place-items: center;
      gap: 0.65rem;
      padding: 2rem;
      border: 1px solid #f0c7c3;
      border-radius: var(--mv-radius-lg);
      color: var(--mv-danger);
      background: #fff8f7;
      text-align: center;
    }
    .error-state h2,
    .error-state p {
      margin: 0;
    }
    .error-state h2 {
      font-size: 1rem;
    }
    .error-state p {
      max-width: 32rem;
      color: var(--mv-text-muted);
      font-size: 0.78rem;
    }
    .error-state button {
      min-height: 2.75rem;
      padding: 0.5rem 1rem;
      border: 0;
      border-radius: var(--mv-radius-sm);
      color: #fff;
      background: var(--mv-danger);
      font-weight: 750;
    }
    .empty-state {
      min-height: 14rem;
      display: grid;
      place-items: center;
      gap: 0.5rem;
      padding: 2rem;
      border: 1px dashed var(--mv-border-strong);
      border-radius: var(--mv-radius-lg);
      color: var(--mv-text-muted);
      background: var(--mv-surface);
      text-align: center;
    }
    .empty-state h2,
    .empty-state p {
      margin: 0;
    }
    .empty-state h2 {
      font-size: 1rem;
    }
    .empty-state p {
      font-size: 0.78rem;
    }
    .dashboard[data-experience='tablet'] .sections {
      grid-template-columns: minmax(0, 1.55fr) minmax(17rem, 0.85fr);
    }
    .dashboard[data-experience='mobile'] {
      gap: 0.75rem;
    }
    .dashboard[data-role='cashier'] {
      gap: 0.9rem;
    }
    .dashboard[data-role='cashier'] .dashboard-header {
      padding-bottom: 0.1rem;
    }
    .dashboard[data-role='cashier'] .sections {
      grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.85fr);
      grid-auto-rows: auto;
      align-items: stretch;
    }
    .dashboard[data-experience='mobile'] .dashboard-header {
      align-items: center;
      padding: 0 0.1rem;
    }
    .dashboard[data-experience='mobile'] .eyebrow {
      display: none;
    }
    .dashboard[data-experience='mobile'] h1 {
      font-size: 1.45rem;
    }
    .dashboard[data-experience='mobile'] .subtitle {
      margin-top: 0.2rem;
      font-size: 0.75rem;
    }
    .dashboard[data-experience='mobile'] .sections {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
    .dashboard[data-experience='mobile'] .updated {
      justify-content: flex-start;
      margin: 0 0.1rem;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (max-width: 900px) {
      .sections,
      .dashboard[data-experience='tablet'] .sections,
      .dashboard[data-role='cashier'] .sections {
        grid-template-columns: 1fr;
      }
      .sections > .section-wide {
        grid-column: auto;
      }
    }
    @media (max-width: 560px) {
      .dashboard-header {
        align-items: center;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .loading-state__icon lucide-icon {
        animation: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly session = inject(SessionStore);
  private readonly dataService = inject(DashboardDataService);
  private readonly destroyRef = inject(DestroyRef);
  readonly config = computed(() => dashboardConfigForRoles(this.session.roles()));
  readonly isCoordinator = computed(() => this.config().role === 'coordinator');
  readonly isVerifier = computed(() => this.config().role === 'verifier');
  readonly data = signal<DashboardData | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly userName = computed(() => this.session.user()?.name || 'Mi cuenta');
  readonly pageTitle = computed(() =>
    this.config().title === 'Hola' ? `Hola, ${firstName(this.userName())}` : this.config().title,
  );
  readonly quickActions = computed<readonly DashboardQuickAction[]>(() => {
    const available = effectiveNavigationItems(
      navigationGroupsForRoles(this.session.roles()),
      BOTTOM_ITEMS,
      this.session.permissions(),
      this.session.roles(),
    );
    const allowedIds = this.config().quickActionIds;
    return available
      .filter((item) => item.route && allowedIds.includes(item.id))
      .sort((a, b) => allowedIds.indexOf(a.id) - allowedIds.indexOf(b.id))
      .map((item) => ({
        id: item.id,
        label: quickActionLabel(item.id, item.title, this.config().role),
        description: item.description || item.group,
        icon: item.icon,
        route: item.route!,
      }));
  });
  readonly visibleSections = computed(() => {
    const sections = this.data()?.sections || [];
    const order = this.config().sectionOrder;
    const config = this.config();
    return sections
      .filter((section) => order.includes(section.id))
      .filter((section) => section.category !== 'report' || config.showReports)
      .filter((section) => section.category !== 'activity' || config.showRecentActivity)
      .filter((section) => section.category !== 'pending' || config.showPendingItems)
      .filter((section) => section.category !== 'alert' || config.showAlerts)
      .map((section) => ({
        ...section,
        route:
          section.route && canNavigate(section.route, this.session.permissions())
            ? section.route
            : undefined,
        items: section.items?.map((item) => ({
          ...item,
          route:
            item.route && canNavigate(item.route, this.session.permissions())
              ? item.route
              : undefined,
        })),
      }))
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  });
  readonly updatedLabel = computed(() => formatUpdated(this.data()?.generatedAt));
  readonly visibleKpis = computed(() =>
    (this.data()?.kpis || [])
      .filter((item) => Boolean(item?.id && item.label?.trim() && item.value?.trim()))
      .map((item) =>
        item.route && !canNavigate(item.route, this.session.permissions())
          ? { ...item, route: undefined }
          : item,
      ),
  );

  ngOnInit(): void {
    if (!this.isCoordinator() && !this.isVerifier()) this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.dataService
      .load(this.config().role)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No fue posible cargar la información de Inicio para tu alcance.');
          this.loading.set(false);
        },
      });
  }
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'bienvenida';
}
function quickActionLabel(id: string, fallback: string, role: string): string {
  if (id === 'payments' && role === 'cashier') return 'Registrar pago';
  return (
    (
      {
        cashier: 'Feriar vale',
        'bank-file': 'Archivo bancario',
        reconciliation: 'Conciliar movimientos',
        clarifications: 'Atender aclaraciones',
        distributors: 'Revisar solicitudes',
        'credit-increases': 'Incrementos de línea',
        'verifier-visits': 'Continuar visitas',
        vouchers: 'Generar vale',
        relations: 'Ver relaciones',
        payments: 'Consultar pagos',
      } as Record<string, string>
    )[id] || fallback
  );
}
function formatUpdated(value?: string): string {
  if (!value) return '';
  return `Datos actualizados ${new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))}`;
}

function canNavigate(route: string, permissions: readonly string[]): boolean {
  const requirements = ROUTE_PERMISSIONS.find(([prefix]) => route.startsWith(prefix))?.[1];
  return !requirements || hasEffectivePermission(permissions, requirements, 'any');
}

const ROUTE_PERMISSIONS: readonly (readonly [string, readonly string[]])[] = [
  [
    '/puntos',
    [
      'points.view_own',
      'points.view_branch',
      'points.view_global',
      'points.request_own',
      'points.authorize_branch',
      'points.authorize_global',
      'points.deliver_branch',
    ],
  ],
  ['/riesgo', ['risk.view_own', 'risk.view_assigned', 'risk.view_branch', 'risk.view_global']],
  [
    '/relaciones-pagos/archivo-bancario',
    ['bank_imports.create_branch', 'bank_imports.view_branch', 'bank_imports.view_global'],
  ],
  ['/relaciones-pagos/conciliacion', ['bank_movements.view_branch', 'bank_movements.view_global']],
  [
    '/relaciones-pagos',
    [
      'relations.view_own',
      'relations.view_assigned',
      'relations.view_branch',
      'relations.view_global',
    ],
  ],
  [
    '/distribuidoras/lineas-credito',
    [
      'credit_lines.view_own',
      'credit_lines.view_assigned',
      'credit_lines.view_branch',
      'credit_lines.view_global',
    ],
  ],
  [
    '/distribuidoras/incrementos-linea',
    [
      'credit_increase_requests.view_own',
      'credit_increase_requests.view_assigned',
      'credit_increase_requests.view_branch',
      'credit_increase_requests.view_global',
    ],
  ],
  [
    '/vales/caja-feriado',
    [
      'vouchers.cash_branch',
      'voucher_modifications.authorize_branch',
      'voucher_modifications.authorize_global',
    ],
  ],
  [
    '/vales',
    [
      'vouchers.create_own',
      'vouchers.view_own',
      'vouchers.view_assigned',
      'vouchers.view_branch',
      'vouchers.view_global',
    ],
  ],
  ['/verificacion-distribuidoras', ['distributor_applications.view']],
  ['/solicitudes-distribuidoras', ['distributor_applications.view']],
];
