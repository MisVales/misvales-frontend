import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MediaApiService } from '../../../core/api/media/media-api.service';
import { SessionStore } from '../../../core/session/session.store';
import {
  ConciliacionApiService,
  SimulatedBankTransfer,
} from '@features/reconciliation/data-access/conciliacion-api.service';
import {
  PaymentItem,
  RelacionesApiService,
  RelationView,
} from '@features/relations/data-access/relaciones-api.service';
import { HistoryFilterBarComponent } from '../../../shared/components/history/history-filter-bar.component';
import { HistoryPaginationComponent } from '../../../shared/components/history/history-pagination.component';
import { RefactorSelectComponent } from '@shared/components/inputs/refactor-select/refactor-select.component';
import { DistributorWorkspaceNavComponent } from '@shared/components/navigation/distributor-workspace-nav/distributor-workspace-nav.component';
import {
  CreditoApiService,
  type CreditLineView,
} from '@features/credit/data-access/credito-api.service';
import { ExcedentesApiService, type Surplus } from '../data-access/excedentes-api.service';
import { DistributorWorkspaceContextService } from '@shared/components/navigation/distributor-workspace-nav/distributor-workspace-context.service';
import {
  BreadcrumbsComponent,
  type BreadcrumbItem,
} from '@shared/components/navigation/breadcrumbs/breadcrumbs.component';

interface PaymentPercentages {
  surcharge: number;
  interest: number;
  insurance: number;
  commission: number;
  capital: number;
}

@Component({
  selector: 'app-pagos-page',
  imports: [
    CommonModule,
    FormsModule,
    HistoryFilterBarComponent,
    HistoryPaginationComponent,
    RefactorSelectComponent,
    LucideAngularModule,
    DistributorWorkspaceNavComponent,
    BreadcrumbsComponent,
  ],
  templateUrl: './pagos-page.component.html',
  styleUrl: './pagos-page.component.css',
})
export class PagosPageComponent implements OnDestroy {
  private readonly api = inject(RelacionesApiService);
  private readonly reconciliationApi = inject(ConciliacionApiService);
  private readonly mediaApi = inject(MediaApiService);
  private readonly session = inject(SessionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly creditApi = inject(CreditoApiService);
  private readonly workspaceContext = inject(DistributorWorkspaceContextService);
  private readonly surplusesApi = inject(ExcedentesApiService);
  private readonly workspaceOwner = {};

  readonly relations = signal<RelationView[]>([]);
  readonly surpluses = signal<Surplus[]>([]);
  readonly selectedRelationId = signal<string | null>(null);
  readonly selectedRelation = signal<RelationView | null>(null);
  readonly searchTerm = signal<string>('');
  readonly contextDistributorNumber = signal<string>('');
  readonly contextDistributorId = signal<string | null>(null);
  readonly distributorDirectoryRoute = computed(() =>
    this.session.roles().includes('coordinator')
      ? '/coordinacion/distribuidoras'
      : '/distribuidoras',
  );
  readonly breadcrumbs = computed<readonly BreadcrumbItem[]>(() => {
    const base: BreadcrumbItem[] = [
      { label: 'Inicio', url: '/inicio' },
      { label: 'Distribuidoras', url: this.distributorDirectoryRoute() },
    ];
    const distributorNumber = this.contextDistributorNumber();
    const distributorId = this.contextDistributorId();
    if (!distributorNumber) return [{ label: 'Inicio', url: '/inicio' }, { label: 'Pagos' }];
    return [
      ...base,
      {
        label: distributorNumber,
        url: distributorId ? `/distribuidoras/${distributorId}` : undefined,
      },
      { label: 'Pagos' },
    ];
  });
  private readonly syncWorkspaceContext = effect(() => {
    const distributorNumber = this.contextDistributorNumber();
    if (!distributorNumber) return;
    this.workspaceContext.set(this.workspaceOwner, {
      distributorId: this.contextDistributorId(),
      distributorNumber,
      active: 'payments',
      backRoute: this.distributorDirectoryRoute(),
    });
  });
  readonly statusFilter = signal<string>('');
  readonly historyPage = signal(1);
  readonly historyPageSize = 10;
  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');
  readonly paymentBusy = signal(false);
  readonly paymentSuccess = signal('');
  readonly surplusAction = signal<Surplus | null>(null);
  readonly surplusBusy = signal(false);
  readonly surplusSuccess = signal('');
  readonly relationPdfBusy = signal(false);
  readonly reportFile = signal<File | null>(null);
  readonly reportReason = signal('');
  readonly reportBusy = signal(false);
  readonly reportSuccess = signal('');
  paymentAmount: number | null = null;
  paymentType: SimulatedBankTransfer['payment_type'] = 'TRANSFER';
  paymentConcept = '';

  readonly filteredRelations = computed(() => {
    const list = this.relations();
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();

    return list.filter((item) => {
      const matchSearch =
        !search ||
        item.payment_reference.toLowerCase().includes(search) ||
        (item.header_snapshot?.name && item.header_snapshot.name.toLowerCase().includes(search)) ||
        (item.distribuidora?.usuario?.name &&
          item.distribuidora.usuario.name.toLowerCase().includes(search)) ||
        (item.distribuidora?.distributor_number &&
          item.distribuidora.distributor_number.toLowerCase().includes(search));

      const matchStatus =
        !status ||
        (status === 'OVERDUE'
          ? this.isOverdue(item.financial_status)
          : item.financial_status === status);

      return matchSearch && matchStatus;
    });
  });
  readonly historyPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredRelations().length / this.historyPageSize)),
  );
  readonly effectiveHistoryPage = computed(() => Math.min(this.historyPage(), this.historyPages()));
  readonly displayedRelations = computed(() => {
    const start = (this.effectiveHistoryPage() - 1) * this.historyPageSize;
    return this.filteredRelations().slice(start, start + this.historyPageSize);
  });

  setHistoryPage(page: number): void {
    this.historyPage.set(Math.max(1, Math.min(page, this.historyPages())));
  }

  relationStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      SETTLED: 'Pagada',
      PARTIALLY_PAID: 'Con abonos',
      OVERDUE: 'Vencida',
      PAST_DUE: 'Vencida',
      PENDING: 'Pendiente',
    };
    return labels[status] ?? 'Pendiente';
  }

  isOverdue(status: string): boolean {
    return ['OVERDUE', 'PAST_DUE'].includes(status);
  }

  readonly metrics = computed(() => {
    const all = this.filteredRelations();
    let totalPaid = 0;
    let totalSurcharge = 0;
    let totalInterest = 0;
    let totalInsurance = 0;
    let totalCommission = 0;
    let totalCapital = 0;
    let totalLineRecovered = 0;
    let totalPaymentsCount = 0;
    let totalRelationsWithPayments = 0;

    for (const rel of all) {
      if (rel.pagos && rel.pagos.length > 0) {
        totalRelationsWithPayments++;
        for (const p of rel.pagos) {
          totalPaymentsCount++;
          totalPaid += parseFloat(p.amount || '0');
          totalSurcharge += parseFloat(p.surcharge_applied || '0');
          totalInterest += parseFloat(p.interest_applied || '0');
          totalInsurance += parseFloat(p.insurance_applied || '0');
          totalCommission += parseFloat(p.commission_applied || '0');
          totalCapital += parseFloat(p.capital_applied || '0');
          totalLineRecovered += parseFloat(p.line_recovered || '0');
        }
      }
    }

    const totalCharges = totalSurcharge + totalInterest + totalInsurance + totalCommission;

    return {
      totalPaid,
      totalCharges,
      totalCapital,
      totalLineRecovered,
      totalPaymentsCount,
      totalRelationsWithPayments,
    };
  });

  readonly creditLine = computed(() => {
    const rel = this.selectedRelation();
    const line = rel?.distribuidora?.linea_credito || rel?.distribuidora?.lineaCredito;

    const totalAuthorized = parseFloat(
      (line?.total_authorized ?? rel?.header_snapshot?.credit_line_total ?? 0).toString(),
    );
    const usedBalance = parseFloat((line?.used_balance ?? 0).toString());
    const available = Math.max(0, totalAuthorized - usedBalance);

    const usedPercentage =
      totalAuthorized > 0 ? Math.min(100, (usedBalance / totalAuthorized) * 100) : 0;
    const availablePercentage = Math.max(0, 100 - usedPercentage);

    return {
      totalAuthorized,
      usedBalance,
      available,
      usedPercentage,
      availablePercentage,
    };
  });

  constructor() {
    const distributorNumber = this.route.snapshot.queryParamMap.get('distribuidora') ?? '';
    this.searchTerm.set(distributorNumber);
    this.contextDistributorNumber.set(distributorNumber);
    this.contextDistributorId.set(this.route.snapshot.queryParamMap.get('distributorId'));
    this.resolveDistributorContext(distributorNumber);
    this.loadRelations();
    this.loadSurpluses();
  }

  ngOnDestroy(): void {
    this.workspaceContext.clear(this.workspaceOwner);
  }

  loadRelations(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.list({ per_page: 50 }).subscribe({
      next: (items) => {
        this.relations.set(items.data);
        if (!this.contextDistributorId()) {
          const contextualRelation = this.filteredRelations().find(
            (item) => item.distribuidora?.id || item.distributor_id,
          );
          this.contextDistributorId.set(
            contextualRelation?.distribuidora?.id ?? contextualRelation?.distributor_id ?? null,
          );
        }
        this.loading.set(false);
        const firstVisibleRelation = this.filteredRelations()[0];
        if (firstVisibleRelation && !this.selectedRelationId()) {
          this.selectRelation(firstVisibleRelation.id);
        }
      },
      error: () => {
        this.error.set('No fue posible cargar las relaciones y pagos.');
        this.loading.set(false);
      },
    });
  }

  private resolveDistributorContext(distributorNumber: string): void {
    if (!distributorNumber || this.contextDistributorId()) return;

    this.creditApi.listarLineas().subscribe({
      next: (lines: CreditLineView[]) => {
        const match = lines.find(
          (line) => line.distributor.distributor_number === distributorNumber,
        );
        this.contextDistributorId.set(match?.distributor.id ?? null);
      },
    });
  }

  selectRelation(id: string): void {
    this.selectedRelationId.set(id);
    this.api.detail(id).subscribe({
      next: (detail) => {
        this.selectedRelation.set(detail);
        this.resetPaymentForm();
      },
      error: () => {
        this.error.set('No fue posible obtener el detalle de la relación.');
      },
    });
  }

  surplusForRelation(relationId: string): Surplus | null {
    return this.surpluses().find((item) => item.origin_relation_id === relationId) ?? null;
  }

  openSurplusActions(surplus: Surplus): void {
    this.surplusAction.set(surplus);
    this.surplusSuccess.set('');
  }

  closeSurplusActions(): void {
    if (!this.surplusBusy()) this.surplusAction.set(null);
  }

  applySurplusAsBalance(): void {
    const surplus = this.surplusAction();
    if (!surplus || this.surplusBusy()) return;
    this.surplusBusy.set(true);
    this.surplusesApi.credit(surplus.id).subscribe({
      next: () => this.finishSurplusAction('El excedente quedó registrado como saldo a favor.'),
      error: (response: HttpErrorResponse) => this.failSurplusAction(response),
    });
  }

  requestSurplusRefund(): void {
    const surplus = this.surplusAction();
    if (!surplus || this.surplusBusy()) return;
    this.surplusBusy.set(true);
    this.surplusesApi.refund(surplus.id).subscribe({
      next: () =>
        this.finishSurplusAction('La solicitud de devolución quedó enviada para revisión.'),
      error: (response: HttpErrorResponse) => this.failSurplusAction(response),
    });
  }

  private loadSurpluses(): void {
    if (
      !this.session
        .permissions()
        .some((permission) =>
          ['surpluses.view_own', 'surpluses.view_branch', 'surpluses.view_global'].includes(
            permission,
          ),
        )
    )
      return;
    this.surplusesApi.list().subscribe({
      next: (items) => this.surpluses.set(items),
      error: () => undefined,
    });
  }

  private finishSurplusAction(message: string): void {
    this.surplusBusy.set(false);
    this.surplusAction.set(null);
    this.surplusSuccess.set(message);
    this.loadSurpluses();
  }

  private failSurplusAction(response: HttpErrorResponse): void {
    this.surplusBusy.set(false);
    this.error.set(response.error?.error?.message ?? 'No fue posible procesar el excedente.');
  }

  getPaymentPercentages(payment: PaymentItem): PaymentPercentages {
    const total = parseFloat(payment.amount || '0');
    if (total <= 0) {
      return { surcharge: 0, interest: 0, insurance: 0, commission: 0, capital: 0 };
    }

    return {
      surcharge: (parseFloat(payment.surcharge_applied || '0') / total) * 100,
      interest: (parseFloat(payment.interest_applied || '0') / total) * 100,
      insurance: (parseFloat(payment.insurance_applied || '0') / total) * 100,
      commission: (parseFloat(payment.commission_applied || '0') / total) * 100,
      capital: (parseFloat(payment.capital_applied || '0') / total) * 100,
    };
  }

  canRegisterPayment(): boolean {
    if (this.session.roles().includes('general_manager')) return false;
    return this.session.permissions().some((permission) =>
      ['bank_imports.create_branch', 'relations.view_own'].includes(permission),
    );
  }

  isCashier(): boolean {
    return this.session.roles().includes('cashier');
  }

  canReportError(): boolean {
    return (
      !this.session.roles().includes('general_manager') &&
      this.session.permissions().includes('payment_clarifications.create_own')
    );
  }

  registerPayment(relation: RelationView): void {
    if (this.paymentAmount === null || this.paymentAmount <= 0) return;
    this.paymentBusy.set(true);
    this.paymentSuccess.set('');
    this.error.set('');
    this.reconciliationApi
      .simulateTransfer({
        relation_id: relation.id,
        amount: this.paymentAmount,
        payment_type: this.isCashier() ? 'COUNTER' : this.paymentType,
        concept: this.isCashier() ? undefined : this.paymentConcept.trim() || undefined,
      })
      .subscribe({
        next: (payment) => {
          if (this.isCashier()) {
            this.downloadCounterTicket(payment);
            return;
          }
          this.paymentBusy.set(false);
          this.paymentSuccess.set(
            'Pago simulado registrado para el siguiente archivo de conciliación de Caja.',
          );
          this.paymentAmount = null;
          this.paymentConcept = '';
        },
        error: (response: HttpErrorResponse) => {
          this.paymentBusy.set(false);
          this.error.set(
            response.error?.error?.message ?? 'No fue posible registrar el pago simulado.',
          );
        },
      });
  }

  private downloadCounterTicket(payment: SimulatedBankTransfer): void {
    this.reconciliationApi.simulationTicket(payment.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${payment.bank_folio}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        this.paymentBusy.set(false);
        this.paymentAmount = null;
        this.paymentSuccess.set(
          'Pago en efectivo guardado para conciliación. El ticket se descargó correctamente.',
        );
      },
      error: () => {
        this.paymentBusy.set(false);
        this.paymentSuccess.set('Pago en efectivo guardado para conciliación.');
        this.error.set('La captura quedó guardada, pero no fue posible descargar el ticket.');
      },
    });
  }

  downloadRelationPdf(relation: RelationView): void {
    this.relationPdfBusy.set(true);
    this.error.set('');
    this.api.download(relation.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relacion-${relation.payment_reference}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        this.relationPdfBusy.set(false);
      },
      error: () => {
        this.relationPdfBusy.set(false);
        this.error.set('No fue posible descargar el PDF de la relación. Intenta nuevamente.');
      },
    });
  }

  selectReportFile(event: Event): void {
    this.reportFile.set((event.target as HTMLInputElement).files?.[0] ?? null);
  }

  submitReport(relation: RelationView): void {
    const file = this.reportFile();
    const reason = this.reportReason().trim();
    if (!file || !reason) return;
    this.reportBusy.set(true);
    this.reportSuccess.set('');
    this.error.set('');
    this.mediaApi
      .upload({
        file,
        owner_type: 'distributor_relation',
        owner_id: relation.id,
        purpose: 'CLARIFICATION',
      })
      .subscribe({
        next: (media) =>
          this.reconciliationApi.createClarification(relation.id, media.data.id, reason).subscribe({
            next: () => {
              this.reportBusy.set(false);
              this.reportFile.set(null);
              this.reportReason.set('');
              this.reportSuccess.set('El reporte quedó enviado a Caja para revisión.');
            },
            error: (response: HttpErrorResponse) => {
              this.reportBusy.set(false);
              this.error.set(
                response.error?.error?.message ?? 'No fue posible registrar el reporte.',
              );
            },
          }),
        error: (response: HttpErrorResponse) => {
          this.reportBusy.set(false);
          this.error.set(
            response.error?.error?.message ?? 'No fue posible subir el ticket o comprobante.',
          );
        },
      });
  }

  private resetPaymentForm(): void {
    this.paymentBusy.set(false);
    this.paymentSuccess.set('');
    this.paymentAmount = null;
    this.paymentType = 'TRANSFER';
    this.paymentConcept = '';
    this.reportFile.set(null);
    this.reportReason.set('');
    this.reportSuccess.set('');
  }
}
