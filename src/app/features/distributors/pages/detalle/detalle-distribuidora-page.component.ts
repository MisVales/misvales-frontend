import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
    HistorialCategoriasComponent,
    AsignarCategoriaDialogComponent,
    ReenviarInvitacionDialogComponent,
    StatusLabelPipe,
    LucideAngularModule,
    EmptyStateComponent,
    DistributorWorkspaceNavComponent,
    BreadcrumbsComponent,
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
  private readonly workspaceContext = inject(DistributorWorkspaceContextService);
  private readonly workspaceOwner = {};

  readonly activeSection = signal<'informacion' | 'credito' | 'historial'>('informacion');
  readonly operationalLoading = signal(true);
  readonly creditLine = signal<CreditLineView | null>(null);
  readonly movements = signal<CreditMovementView[]>([]);
  readonly increases = signal<CreditIncreaseView[]>([]);
  readonly relations = signal<RelationView[]>([]);
  readonly riskAlerts = signal<RiskAlert[]>([]);
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
