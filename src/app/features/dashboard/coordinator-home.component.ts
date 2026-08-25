import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { catchError, forkJoin, of } from 'rxjs';
import { hasEffectivePermission } from '@core/authorization/navigation.permissions';
import { SessionStore } from '@core/session/session.store';
import { EmptyStateComponent } from '@shared/components/status/empty-state/empty-state.component';
import {
  CreditoApiService,
  type CreditIncreaseView,
  type CreditLineView,
} from '@features/credit/data-access/credito-api.service';
import { RiesgoApiService, type RiskAlert } from '@features/delinquency/riesgo-api.service';
import {
  ConciliacionApiService,
  type ManualReconciliationRequest,
} from '@features/reconciliation/data-access/conciliacion-api.service';
import {
  RelacionesApiService,
  type RelationView,
} from '@features/relations/data-access/relaciones-api.service';
import { VerificacionDistribuidorasApiService } from '@features/verifications/data-access/api/verificacion-distribuidoras-api.service';
import type { SolicitudDistribuidoraResponseDto } from '@features/verifications/data-access/dtos/verificacion-distribuidoras.dtos';

type CoordinatorFilter = 'all' | 'active' | 'applications';
type CoordinatorRow =
  | {
      kind: 'line';
      id: string;
      key: string;
      name: string;
      owner: string;
      status: string;
      total: number;
      available: number;
      pending: string;
      route: string;
      source: CreditLineView;
    }
  | {
      kind: 'application';
      id: string;
      key: string;
      name: string;
      owner: string;
      status: string;
      total: null;
      available: null;
      pending: string;
      route: string;
      source: SolicitudDistribuidoraResponseDto;
    };

interface FeedItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  tone: 'green' | 'blue' | 'orange' | 'red';
  icon: string;
  route: string;
  category: 'applications' | 'credit' | 'payments' | 'risk';
}

export type CoordinatorView = 'home' | 'distribuidoras' | 'pendientes' | 'alertas';

@Component({
  selector: 'app-coordinator-home',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, EmptyStateComponent],
  templateUrl: './coordinator-home.component.html',
  styleUrl: './coordinator-home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoordinatorHomeComponent {
  readonly Math = Math;
  readonly view = input<CoordinatorView>('home');
  private readonly verification = inject(VerificacionDistribuidorasApiService);
  private readonly credit = inject(CreditoApiService);
  private readonly reconciliation = inject(ConciliacionApiService);
  private readonly relationsApi = inject(RelacionesApiService);
  private readonly risk = inject(RiesgoApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly partial = signal(false);
  readonly applications = signal<SolicitudDistribuidoraResponseDto[]>([]);
  readonly applicationTotal = signal(0);
  readonly lines = signal<CreditLineView[]>([]);
  readonly increases = signal<CreditIncreaseView[]>([]);
  readonly reconciliations = signal<ManualReconciliationRequest[]>([]);
  readonly relations = signal<RelationView[]>([]);
  readonly alerts = signal<RiskAlert[]>([]);
  readonly query = signal('');
  readonly filter = signal<CoordinatorFilter>('all');
  readonly selectedId = signal<string | null>(null);
  readonly feedFilter = signal<'all' | FeedItem['category']>('all');

  readonly rows = computed<CoordinatorRow[]>(() => [
    ...this.lines().map((line) => ({
      kind: 'line' as const,
      id: line.id,
      key: line.distributor.distributor_number,
      name: line.distributor.full_name || line.distributor.distributor_number,
      owner: 'Distribuidora activa',
      status: 'Activa',
      total: Number(line.total_authorized),
      available: Number(line.available_balance),
      pending: Number(line.used_balance) > 0 ? 'Con saldo utilizado' : 'Sin saldo utilizado',
      route: `/distribuidoras/${line.distributor.id}`,
      source: line,
    })),
    ...this.applications().map((application) => ({
      kind: 'application' as const,
      id: application.id,
      key: application.application_number,
      name: application.applicant.full_name || 'Solicitante sin nombre',
      owner: application.branch.name || 'Solicitud nueva',
      status: applicationStatus(application.status),
      total: null,
      available: null,
      pending: applicationPending(application),
      route: `/verificacion-distribuidoras/solicitudes-distribuidora/${application.id}`,
      source: application,
    })),
  ]);
  readonly filteredRows = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('es-MX');
    return this.rows().filter((row) => {
      if (this.filter() === 'active' && row.kind !== 'line') return false;
      if (this.filter() === 'applications' && row.kind !== 'application') return false;
      return (
        !query || `${row.key} ${row.name} ${row.owner}`.toLocaleLowerCase('es-MX').includes(query)
      );
    });
  });
  readonly selected = computed(() => {
    const rows = this.filteredRows();
    return rows.find((row) => row.id === this.selectedId()) || rows[0] || null;
  });
  readonly pendingItems = computed<FeedItem[]>(() => [
    ...this.increases()
      .filter(
        (item) =>
          item.capabilities?.can_preauthorize ||
          ['REQUESTED', 'PENDING_COORDINATOR'].includes(item.status),
      )
      .map((item) => ({
        id: `increase-${item.id}`,
        title: 'Incremento de línea',
        subtitle: item.distributor?.full_name || item.request_number,
        meta: relativeDate(item.requested_at),
        status: 'Pendiente',
        tone: 'orange' as const,
        icon: 'circle-arrow-up',
        route: '/distribuidoras/incrementos-linea',
        category: 'credit' as const,
      })),
    ...this.reconciliations()
      .filter((item) => !['EXECUTED', 'REJECTED'].includes(item.status))
      .map((item) => ({
        id: `reconciliation-${item.id}`,
        title: 'Conciliación manual',
        subtitle: item.distributor_name || item.bank_folio,
        meta: relativeDate(item.created_at),
        status: reconciliationStatus(item.status),
        tone: 'blue' as const,
        icon: 'git-merge',
        route: '/relaciones-pagos/conciliacion',
        category: 'payments' as const,
      })),
    ...this.applications()
      .filter((item) =>
        ['COORDINATOR_REVIEW', 'COORDINATOR_CORRECTION', 'COORDINATOR_EVALUATION'].includes(
          item.status,
        ),
      )
      .map((item) => ({
        id: `application-${item.id}`,
        title: applicationAction(item.status),
        subtitle: item.applicant.full_name || item.application_number,
        meta: relativeDate(item.submitted_at),
        status: applicationStatus(item.status),
        tone: 'orange' as const,
        icon: 'clipboard-check',
        route: `/verificacion-distribuidoras/solicitudes-distribuidora/${item.id}`,
        category: 'applications' as const,
      })),
  ]);
  readonly alertItems = computed<FeedItem[]>(() => [
    ...this.alerts()
      .filter((item) => item.status === 'OPEN')
      .map((item) => ({
        id: item.id,
        title: riskTitle(item),
        subtitle: riskSubtitle(item),
        meta: relativeDate(item.created_at),
        status: riskSeverity(item),
        tone: item.consecutive_defaults >= 3 ? ('red' as const) : ('orange' as const),
        icon: 'triangle-alert',
        route: '/riesgo',
        category: 'risk' as const,
      })),
    ...this.relations()
      .filter((item) => Number(item.balance) > 0 || item.financial_status === 'OVERDUE')
      .map((item) => ({
        id: `relation-${item.id}`,
        title: item.financial_status === 'OVERDUE' ? 'Relación vencida' : 'Relación con saldo',
        subtitle:
          item.distribuidora?.usuario?.name || item.header_snapshot.name || item.payment_reference,
        meta: relativeDate(item.payment_deadline_at),
        status: item.financial_status === 'OVERDUE' ? 'Alta' : 'Seguimiento',
        tone: item.financial_status === 'OVERDUE' ? ('red' as const) : ('orange' as const),
        icon: 'receipt-text',
        route: '/relaciones-pagos/relaciones',
        category: 'risk' as const,
      })),
  ]);
  readonly visiblePendingItems = computed(() =>
    this.pendingItems().filter(
      (item) => this.feedFilter() === 'all' || item.category === this.feedFilter(),
    ),
  );
  readonly pendingApplicationCount = computed(
    () => this.pendingItems().filter((item) => item.category === 'applications').length,
  );
  readonly pendingCreditCount = computed(
    () => this.pendingItems().filter((item) => item.category === 'credit').length,
  );
  readonly pendingPaymentCount = computed(
    () => this.pendingItems().filter((item) => item.category === 'payments').length,
  );
  readonly criticalAlertCount = computed(
    () => this.alertItems().filter((item) => item.tone === 'red').length,
  );
  readonly followUpAlertCount = computed(
    () => this.alertItems().filter((item) => item.tone === 'orange').length,
  );
  readonly pendingCount = computed(
    () =>
      this.increases().filter(
        (item) =>
          item.capabilities?.can_preauthorize ||
          ['REQUESTED', 'PENDING_COORDINATOR'].includes(item.status),
      ).length +
      this.reconciliations().filter((item) => !['EXECUTED', 'REJECTED'].includes(item.status))
        .length +
      this.applications().filter((item) =>
        ['COORDINATOR_REVIEW', 'COORDINATOR_CORRECTION', 'COORDINATOR_EVALUATION'].includes(
          item.status,
        ),
      ).length,
  );
  readonly openAlertCount = computed(() => this.alertItems().length);
  readonly canTransfer = computed(() =>
    hasEffectivePermission(
      this.session.permissions(),
      [
        'client_transfers.view',
        'client_transfers.decide_assigned',
        'organization_changes.view',
        'organization_changes.manage_branch',
        'organization_changes.manage_global',
      ],
      'any',
    ),
  );
  readonly canViewPayments = computed(() =>
    hasEffectivePermission(
      this.session.permissions(),
      [
        'relations.view_own',
        'relations.view_assigned',
        'relations.view_branch',
        'relations.view_global',
      ],
      'any',
    ),
  );
  readonly canCreateApplication = computed(() =>
    hasEffectivePermission(this.session.permissions(), ['distributor_applications.create']),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.partial.set(false);
    const safe = <T>(source: import('rxjs').Observable<T>, fallback: T) =>
      source.pipe(
        catchError(() => {
          this.partial.set(true);
          return of(fallback);
        }),
      );
    forkJoin({
      applications: safe(this.verification.listarSolicitudes({ page: 1, perPage: 30 }), {
        data: [],
        total: 0,
        page: 1,
        perPage: 30,
      }),
      lines: safe(this.credit.listarLineas(), []),
      increases: safe(this.credit.listarIncrementos(1, 50), {
        data: [],
        meta: { current_page: 1, last_page: 1, total: 0 },
      }),
      reconciliations: safe(this.reconciliation.manualRequests(), []),
      relations: safe(this.relationsApi.list({ page: 1, per_page: 50 }), {
        data: [],
        current_page: 1,
        last_page: 1,
        total: 0,
      }),
      alerts: safe(this.risk.alerts(), []),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.applications.set(data.applications.data);
        this.applicationTotal.set(data.applications.total);
        this.lines.set(data.lines);
        this.increases.set(data.increases.data);
        this.reconciliations.set(data.reconciliations);
        this.relations.set(data.relations.data);
        this.alerts.set(data.alerts);
        this.selectedId.set(data.lines[0]?.id || data.applications.data[0]?.id || null);
        this.loading.set(false);
      });
  }

  setQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
  selectFilter(filter: CoordinatorFilter): void {
    this.filter.set(filter);
    this.selectedId.set(null);
  }
  select(row: CoordinatorRow): void {
    this.selectedId.set(row.id);
  }
  openRow(row: CoordinatorRow): void {
    void this.router.navigateByUrl(row.route);
  }
  money(value: number | null): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
  percent(row: CoordinatorRow): number {
    return row.kind === 'line' && row.total > 0 ? Math.round((row.available / row.total) * 100) : 0;
  }
}

function applicationStatus(status: string): string {
  return (
    (
      {
        COORDINATOR_REVIEW: 'En revisión',
        VERIFIER_ASSIGNED: 'Verificador asignado',
        PHYSICAL_VERIFICATION: 'En verificación',
        COORDINATOR_CORRECTION: 'Con correcciones',
        COORDINATOR_EVALUATION: 'En evaluación',
        MANAGER_AUTHORIZATION: 'Por autorizar',
        AUTHORIZED_PENDING_ACTIVATION: 'Autorizada',
        ACTIVE: 'Activa',
        REJECTED: 'Rechazada',
        TERMINATED_UNFAVORABLE: 'No favorable',
      } as Record<string, string>
    )[status] || 'En proceso'
  );
}
function applicationPending(item: SolicitudDistribuidoraResponseDto): string {
  const differences =
    item.verification_visits?.reduce(
      (total, visit) => total + (visit.differences_payload?.items?.length || 0),
      0,
    ) || 0;
  return differences ? `${differences} diferencias` : applicationAction(item.status);
}
function applicationAction(status: string): string {
  return (
    (
      {
        COORDINATOR_REVIEW: 'Revisar solicitud',
        COORDINATOR_CORRECTION: 'Revisar correcciones',
        COORDINATOR_EVALUATION: 'Evaluar solicitud',
      } as Record<string, string>
    )[status] || 'Dar seguimiento'
  );
}
function reconciliationStatus(status: string): string {
  return status === 'AUTHORIZED'
    ? 'Autorizada'
    : status === 'REQUESTED'
      ? 'Pendiente'
      : 'En revisión';
}
function riskTitle(item: RiskAlert): string {
  return item.consecutive_defaults >= 3
    ? 'Incumplimiento consecutivo'
    : item.type.toLocaleLowerCase().includes('credit')
      ? 'Riesgo de crédito'
      : 'Relación con saldo';
}
function riskSubtitle(item: RiskAlert): string {
  return (
    item.distribuidora?.usuario?.name ||
    item.distribuidora?.distributor_number ||
    `${item.consecutive_defaults} incumplimientos consecutivos`
  );
}
function riskSeverity(item: RiskAlert): string {
  return item.consecutive_defaults >= 3
    ? 'Crítica'
    : item.consecutive_defaults === 2
      ? 'Alta'
      : 'Seguimiento';
}
function relativeDate(value?: string | null): string {
  if (!value) return 'Sin fecha';
  const elapsed = Date.now() - new Date(value).getTime();
  const hours = Math.max(0, Math.floor(elapsed / 3_600_000));
  return hours < 1
    ? 'Hace menos de 1 h'
    : hours < 24
      ? `Hace ${hours} h`
      : `Hace ${Math.floor(hours / 24)} d`;
}
