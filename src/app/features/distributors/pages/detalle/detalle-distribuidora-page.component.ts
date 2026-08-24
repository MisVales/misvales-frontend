import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { AlertService } from '../../../../shared/components/alerts/alert.service';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label.pipe';
import { EmptyStateComponent } from '../../../../shared/components/status/empty-state/empty-state.component';
import {
  DistributorWorkspaceNavComponent,
  type DistributorWorkspaceSection,
} from '../../../../shared/components/navigation/distributor-workspace-nav/distributor-workspace-nav.component';
import {
  CreditoApiService,
  type CreditIncreaseView,
  type CreditLineView,
  type CreditMovementView,
} from '../../../credit/data-access/credito-api.service';
import { RiesgoApiService, type RiskAlert } from '../../../delinquency/riesgo-api.service';
import {
  RelacionesApiService,
  type RelationView,
} from '../../../relations/data-access/relaciones-api.service';
import { HistorialCategoriasComponent } from '../../components/historial-categorias/historial-categorias.component';
import { DistribuidorasApiService } from '../../data-access/api/distribuidoras-api.service';
import { AsignarCategoriaDialogComponent } from '../../dialogs/asignar-categoria-dialog/asignar-categoria-dialog.component';
import { ReenviarInvitacionDialogComponent } from '../../dialogs/reenviar-invitacion-dialog/reenviar-invitacion-dialog.component';
import { DistribuidorasStore } from '../../state/distribuidoras.store';
import { SessionStore } from '../../../../core/session/session.store';
import { apiErrorMessage } from '../../../../core/api/api-error';
import { RefactorSelectComponent } from '../../../../shared/components/inputs/refactor-select/refactor-select.component';
import { OrganizationApiService } from '../../../organization/data-access/organization-api.service';
import type { PersonnelAssignment } from '../../../organization/data-access/organization.dtos';
import { DistributorWorkspaceContextService } from '../../../../shared/components/navigation/distributor-workspace-nav/distributor-workspace-context.service';
import {
  BreadcrumbsComponent,
  type BreadcrumbItem,
} from '../../../../shared/components/navigation/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-detalle-distribuidora-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HistorialCategoriasComponent,
    AsignarCategoriaDialogComponent,
    ReenviarInvitacionDialogComponent,
    StatusLabelPipe,
    LucideAngularModule,
    EmptyStateComponent,
    DistributorWorkspaceNavComponent,
    BreadcrumbsComponent,
    RefactorSelectComponent,
  ],
  templateUrl: './detalle-distribuidora-page.component.html',
  styleUrl: './detalle-distribuidora-page.component.css',
})
export class DetalleDistribuidoraPageComponent implements OnInit, OnDestroy {
  readonly store = inject(DistribuidorasStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(DistribuidorasApiService);
  private readonly alerts = inject(AlertService);
  private readonly credit = inject(CreditoApiService);
  private readonly relationsApi = inject(RelacionesApiService);
  private readonly riskApi = inject(RiesgoApiService);
  private readonly session = inject(SessionStore);
  private readonly organizationApi = inject(OrganizationApiService);
  private readonly workspaceContext = inject(DistributorWorkspaceContextService);
  private readonly workspaceOwner = {};

  readonly activeSection = signal<'informacion' | 'credito' | 'historial'>('informacion');
  readonly operationalLoading = signal(true);
  readonly creditLine = signal<CreditLineView | null>(null);
  readonly movements = signal<CreditMovementView[]>([]);
  readonly increases = signal<CreditIncreaseView[]>([]);
  readonly relations = signal<RelationView[]>([]);
  readonly riskAlerts = signal<RiskAlert[]>([]);
  readonly transferOpen = signal(false);
  readonly transferLoading = signal(false);
  readonly transferError = signal('');
  readonly selectedCoordinatorId = signal('');
  readonly coordinators = signal<PersonnelAssignment[]>([]);
  readonly canTransfer = computed(() => {
    const permissions = this.session.permissions();
    return permissions.includes('assignments.manage') || permissions.includes('all');
  });
  readonly coordinatorOptions = computed(() => {
    const currentCoordinatorId = this.store.detalle()?.coordinador?.id;
    const seen = new Set<string>();
    return this.coordinators()
      .filter(
        (assignment) =>
          assignment.assignment_status === 'ACTIVE' &&
          assignment.role.code === 'coordinator' &&
          assignment.user.id !== currentCoordinatorId,
      )
      .filter((assignment) =>
        seen.has(assignment.user.id) ? false : (seen.add(assignment.user.id), true),
      )
      .map((assignment) => ({ value: assignment.user.id, label: assignment.user.name }));
  });
  readonly workspaceSection = computed<DistributorWorkspaceSection>(() => {
    if (this.activeSection() === 'credito') return 'credit';
    if (this.activeSection() === 'historial') return 'history';
    return 'summary';
  });
  readonly distributorDirectoryRoute = computed(() =>
    this.session.roles().includes('coordinator')
      ? '/coordinacion/distribuidoras'
      : '/distribuidoras',
  );
  readonly breadcrumbs = computed<readonly BreadcrumbItem[]>(() => {
    const distributor = this.store.detalle();
    if (!distributor) return [];
    const base: BreadcrumbItem[] = [
      { label: 'Inicio', url: '/inicio' },
      { label: 'Distribuidoras', url: this.distributorDirectoryRoute() },
    ];
    const section = this.workspaceSection();
    if (section === 'summary') return [...base, { label: distributor.nombreCompleto }];
    return [
      ...base,
      { label: distributor.nombreCompleto, url: `/distribuidoras/${distributor.id}` },
      { label: section === 'credit' ? 'Crédito' : 'Historial' },
    ];
  });
  private readonly syncWorkspaceContext = effect(() => {
    const distributor = this.store.detalle();
    if (!distributor) return;
    this.workspaceContext.set(this.workspaceOwner, {
      distributorId: distributor.id,
      distributorNumber: distributor.numero,
      active: this.workspaceSection(),
      backRoute: this.distributorDirectoryRoute(),
    });
  });

  mostrarModalCategoria = false;
  mostrarModalReenvio = false;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const requestedSection = params.get('section');
      this.activeSection.set(
        requestedSection === 'credito' || requestedSection === 'historial'
          ? requestedSection
          : 'informacion',
      );
    });
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        void this.store.cargarDetalle(id);
        void this.loadOperationalContext(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.workspaceContext.clear(this.workspaceOwner);
    this.store.limpiarDetalle();
  }

  abrirModalCategoria(): void {
    this.mostrarModalCategoria = true;
  }

  cerrarModalCategoria(): void {
    this.mostrarModalCategoria = false;
  }

  async guardarCategoria(event: any): Promise<void> {
    const distributor = this.store.detalle();
    if (!distributor) return;
    try {
      await firstValueFrom(
        this.api.asignarCategoria(distributor.id, distributor.versionBloqueo, event),
      );
      this.cerrarModalCategoria();
      void this.store.cargarDetalle(distributor.id);
    } catch (error: any) {
      this.alerts.showAlert(
        error?.error?.message || 'No fue posible asignar la categoría.',
        'error',
      );
    }
  }

  abrirModalReenvio(): void {
    this.mostrarModalReenvio = true;
  }

  cerrarModalReenvio(): void {
    this.mostrarModalReenvio = false;
  }

  async reenviarInvitacion(event: any): Promise<void> {
    const distributor = this.store.detalle();
    if (!distributor) return;
    try {
      await firstValueFrom(this.api.reenviarInvitacion(distributor.id, event));
      this.cerrarModalReenvio();
      this.alerts.showAlert('Invitación reenviada.', 'success');
    } catch (error: any) {
      this.alerts.showAlert(
        error?.error?.message || 'No fue posible reenviar la invitación.',
        'error',
      );
    }
  }

  volver(): void {
    void this.router.navigate([this.distributorDirectoryRoute()]);
  }

  async abrirTransferencia(): Promise<void> {
    const distributor = this.store.detalle();
    if (!distributor || !this.canTransfer()) return;

    this.transferOpen.set(true);
    this.transferError.set('');
    this.selectedCoordinatorId.set('');
    if (this.coordinators().length) return;

    this.transferLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.organizationApi.getBranchAssignments(distributor.sucursal.id, { status: 'ACTIVE' }),
      );
      this.coordinators.set(response.data);
    } catch (error: unknown) {
      this.transferError.set(
        apiErrorMessage(error, 'No fue posible cargar los coordinadores disponibles.'),
      );
    } finally {
      this.transferLoading.set(false);
    }
  }

  cerrarTransferencia(): void {
    if (this.transferLoading()) return;
    this.transferOpen.set(false);
    this.transferError.set('');
    this.selectedCoordinatorId.set('');
  }

  seleccionarCoordinador(value: string | number | boolean | null): void {
    this.selectedCoordinatorId.set(typeof value === 'string' ? value : '');
    this.transferError.set('');
  }

  async transferirDistribuidora(): Promise<void> {
    const distributor = this.store.detalle();
    const coordinatorId = this.selectedCoordinatorId();
    if (!distributor || !coordinatorId || this.transferLoading()) return;

    this.transferLoading.set(true);
    this.transferError.set('');
    try {
      await firstValueFrom(
        this.organizationApi.assignCoordinatorDistributor({
          branch_id: distributor.sucursal.id,
          distributor_id: distributor.id,
          coordinator_id: coordinatorId,
        }),
      );
      await this.store.cargarDetalle(distributor.id);
      this.transferOpen.set(false);
      this.selectedCoordinatorId.set('');
      this.alerts.success('La distribuidora fue transferida al coordinador seleccionado.');
    } catch (error: unknown) {
      this.transferError.set(apiErrorMessage(error, 'No fue posible transferir la distribuidora.'));
    } finally {
      this.transferLoading.set(false);
    }
  }

  money(value: string | number | null | undefined): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
  }

  usedPercent(): number {
    const line = this.creditLine();
    if (!line || Number(line.total_authorized) <= 0) return 0;
    return Math.min(
      100,
      Math.round((Number(line.used_balance) / Number(line.total_authorized)) * 100),
    );
  }

  availableBalance(fallbackAuthorized: string | number | null = 0): number {
    const line = this.creditLine();
    if (!line) return Math.max(0, Number(fallbackAuthorized ?? 0));

    const authorized = Number(line.total_authorized ?? 0);
    const used = Number(line.used_balance ?? 0);
    const reported = Number(line.available_balance ?? 0);

    if (reported > 0 || authorized <= used || line.restriction) return Math.max(0, reported);
    return Math.max(0, authorized - used);
  }

  relationStatus(status: string): string {
    return (
      {
        SETTLED: 'Liquidada',
        PARTIALLY_PAID: 'Con abonos',
        PENDING: 'Pendiente',
        OVERDUE: 'Vencida',
      }[status] ?? status.replaceAll('_', ' ')
    );
  }

  increaseStatus(status: string): string {
    return (
      {
        REQUESTED: 'Solicitada',
        PREAUTHORIZED: 'Preautorizada',
        AUTHORIZED: 'Autorizada',
        REJECTED: 'Rechazada',
      }[status] ?? status.replaceAll('_', ' ')
    );
  }

  private async loadOperationalContext(distributorId: string): Promise<void> {
    this.operationalLoading.set(true);
    const safe = async <T>(promise: Promise<T>, fallback: T): Promise<T> => {
      try {
        return await promise;
      } catch {
        return fallback;
      }
    };
    const [lines, movements, increases, relations, alerts] = await Promise.all([
      safe(firstValueFrom(this.credit.listarLineas()), [] as CreditLineView[]),
      safe(
        firstValueFrom(this.credit.listarMovimientos(distributorId)),
        [] as CreditMovementView[],
      ),
      safe(
        firstValueFrom(this.credit.listarIncrementos(1, 100)).then((response) => response.data),
        [] as CreditIncreaseView[],
      ),
      safe(
        firstValueFrom(this.relationsApi.list({ page: 1, per_page: 100 })).then(
          (response) => response.data,
        ),
        [] as RelationView[],
      ),
      safe(firstValueFrom(this.riskApi.alerts()), [] as RiskAlert[]),
    ]);
    this.creditLine.set(lines.find((line) => line.distributor.id === distributorId) ?? null);
    this.movements.set(movements);
    this.increases.set(increases.filter((item) => item.distributor?.id === distributorId));
    this.relations.set(relations.filter((item) => item.distributor_id === distributorId));
    this.riskAlerts.set(alerts.filter((item) => item.distributor_id === distributorId));
    this.operationalLoading.set(false);
  }
}
