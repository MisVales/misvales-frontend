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
  PaymentAllocation,
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
import { type DelinquencyStatus, RiesgoApiService } from '@features/delinquency/riesgo-api.service';
import { groupSurpluses, type SurplusGroup } from '../data-access/surplus-group';
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

interface RelationMoneyRoute {
  inherited: number;
  current: number;
  inheritedPaid: number;
  currentPaid: number;
  outstanding: number;
  points: number;
}

type InstallmentDisplayStatus = 'PAID' | 'LATE_PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING';

interface VoucherInstallmentTimeline {
  id: string;
  number: number;
  total: number;
  clientAmount: number;
  misvalesAmount: number;
  paid: number;
  status: InstallmentDisplayStatus;
}

interface VoucherInstallmentGroup {
  folio: string;
  client: string;
  product: string;
  totalInstallments: number;
  installments: VoucherInstallmentTimeline[];
  clientTotal: number;
  paidTotal: number;
  overdueTotal: number;
  paidCount: number;
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
  private readonly riskApi = inject(RiesgoApiService);
  private readonly workspaceOwner = {};

  readonly relations = signal<RelationView[]>([]);
  readonly surpluses = signal<Surplus[]>([]);
  readonly selectedRelationId = signal<string | null>(null);
  readonly selectedRelation = signal<RelationView | null>(null);
  readonly selectedPaymentId = signal<string | null>(null);
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
  readonly surplusAction = signal<SurplusGroup | null>(null);
  readonly surplusBusy = signal(false);
  readonly surplusSuccess = signal('');
  readonly delinquencyStatus = signal<DelinquencyStatus | null>(null);
  readonly removalBusy = signal(false);
  readonly removalSuccess = signal('');
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
      ROLLED_FORWARD: 'Vencida',
    };
    return labels[status] ?? 'Pendiente';
  }

  isOverdue(status: string): boolean {
    return ['OVERDUE', 'PAST_DUE', 'ROLLED_FORWARD'].includes(status);
  }

  readonly metrics = computed(() => {
    const all = this.filteredRelations();
    let totalPaid = 0;
    let totalTransferred = 0;
    let totalSurplus = 0;
    let totalSurcharge = 0;
    let totalInterest = 0;
    let totalInsurance = 0;
    let totalCommission = 0;
    let totalCapital = 0;
    let totalLineRecovered = 0;
    let totalPaymentsCount = 0;
    let totalRelationsWithPayments = 0;

    for (const rel of all) {
      const payments = this.paymentsForRelation(rel);
      if (payments.length > 0) {
        totalRelationsWithPayments++;
        for (const p of payments) {
          totalPaymentsCount++;
          totalPaid += parseFloat(p.amount || '0');
          totalTransferred += this.paymentTransferred(p);
          totalSurplus += this.paymentSurplus(p);
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
      totalTransferred,
      totalSurplus,
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
    if (this.session.roles().includes('distributor')) {
      this.loadDelinquencyStatus();
    }
  }

  requestDelinquencyRemoval(): void {
    const distributorId = this.relations()[0]?.distributor_id;
    if (!distributorId || !this.delinquencyStatus()?.can_request_removal) return;
    this.removalBusy.set(true);
    this.error.set('');
    this.riskApi
      .requestRemoval(distributorId, 'La deuda acumulada de morosidad fue liquidada.')
      .subscribe({
        next: () => {
          this.removalBusy.set(false);
          this.removalSuccess.set('Solicitud de retiro enviada a Gerencia.');
          this.loadDelinquencyStatus();
        },
        error: (response: HttpErrorResponse) => {
          this.removalBusy.set(false);
          this.error.set(response.error?.message ?? 'No fue posible solicitar el retiro.');
        },
      });
  }

  private loadDelinquencyStatus(): void {
    this.riskApi.me().subscribe({
      next: (status) => this.delinquencyStatus.set(status),
      error: () => this.delinquencyStatus.set(null),
    });
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
        this.selectedPaymentId.set(this.paymentsForRelation(detail).at(-1)?.id ?? null);
        this.resetPaymentForm();
      },
      error: () => {
        this.error.set('No fue posible obtener el detalle de la relación.');
      },
    });
  }

  selectPayment(paymentId: string): void {
    this.selectedPaymentId.set(paymentId);
  }

  selectedPayment(): PaymentItem | null {
    const id = this.selectedPaymentId();
    const relation = this.selectedRelation();
    return relation
      ? (this.paymentsForRelation(relation).find((payment) => payment.id === id) ?? null)
      : null;
  }

  paymentsForRelation(relation: RelationView): PaymentItem[] {
    const payments = relation.pagos ?? [];
    const creditPayments = payments.filter((payment) => payment.source_type === 'CREDIT_BALANCE');
    if (creditPayments.length <= 1) return payments;

    const total = (field: keyof PaymentItem): string =>
      creditPayments.reduce((sum, payment) => sum + Number(payment[field] ?? 0), 0).toFixed(4);
    const aggregate: PaymentItem = {
      ...creditPayments[0],
      id: `credit-balance:${relation.id}`,
      source_id: relation.id,
      amount: total('amount'),
      surcharge_applied: total('surcharge_applied'),
      interest_applied: total('interest_applied'),
      insurance_applied: total('insurance_applied'),
      commission_applied: total('commission_applied'),
      capital_applied: total('capital_applied'),
      line_recovered: total('line_recovered'),
      asignaciones: creditPayments.flatMap((payment) => payment.asignaciones ?? []),
      applied_at:
        creditPayments
          .map((payment) => payment.applied_at)
          .sort()
          .at(-1) ?? creditPayments[0].applied_at,
    };

    return [
      ...payments.filter((payment) => payment.source_type !== 'CREDIT_BALANCE'),
      aggregate,
    ].sort((left, right) => left.applied_at.localeCompare(right.applied_at));
  }

  allocationsFor(payment: PaymentItem): PaymentAllocation[] {
    return payment.asignaciones ?? [];
  }

  allocationComponentLabel(component: PaymentAllocation['component']): string {
    const labels: Record<PaymentAllocation['component'], string> = {
      SURCHARGE: 'Recargo',
      INTEREST: 'Interés',
      INSURANCE: 'Seguro',
      LOAN_COMMISSION: 'Comisión MisVales',
      CAPITAL: 'Capital',
    };
    return labels[component];
  }

  distributorProfit(relation: RelationView): number {
    return (relation.partidas ?? []).reduce(
      (total, item) => total + Number(item.snapshot['distributor_profit'] ?? 0),
      0,
    );
  }

  relationMoneyRoute(relation: RelationView): RelationMoneyRoute {
    const inherited = Number(relation.carried_balance ?? 0);
    const total = Number(relation.misvales_total ?? 0);
    const applied = this.paymentsForRelation(relation).reduce(
      (sum, payment) => sum + Number(payment.amount ?? 0),
      0,
    );
    const inheritedPaid = Math.min(applied, inherited);

    return {
      inherited,
      current: Math.max(0, total - inherited),
      inheritedPaid,
      currentPaid: Math.max(0, applied - inheritedPaid),
      outstanding: Number(relation.balance ?? 0),
      points: (relation.puntos_ganados ?? []).reduce(
        (sum, movement) => sum + Number(movement.points ?? 0),
        0,
      ),
    };
  }

  paidForInstallment(relation: RelationView, itemId: string): number {
    return this.paymentsForRelation(relation).reduce(
      (sum, payment) =>
        sum +
        this.allocationsFor(payment)
          .filter((allocation) => allocation.relation_item_id === itemId)
          .reduce((allocationSum, allocation) => allocationSum + Number(allocation.amount), 0),
      0,
    );
  }

  groupedInstallments(selected: RelationView): VoucherInstallmentGroup[] {
    const selectedCutoff = new Date(selected.cutoff_at).getTime();
    const selectedSettled = selected.financial_status === 'SETTLED';
    const groups = new Map<string, VoucherInstallmentGroup>();

    for (const relation of this.relations()) {
      if (selected.distributor_id && relation.distributor_id !== selected.distributor_id) continue;
      if (new Date(relation.cutoff_at).getTime() > selectedCutoff) continue;

      for (const item of relation.partidas ?? []) {
        const folio = String(item.snapshot['folio'] || 'Sin folio');
        const number = Number(item.snapshot['installment'] || 0);
        const key = `${folio}:${number}`;
        let group = groups.get(folio);
        if (!group) {
          group = {
            folio,
            client: String(item.snapshot['client'] || 'Cliente sin dato'),
            product: String(item.snapshot['product'] || 'Producto sin dato'),
            totalInstallments: Number(item.snapshot['total_installments'] || 0),
            installments: [],
            clientTotal: 0,
            paidTotal: 0,
            overdueTotal: 0,
            paidCount: 0,
          };
          groups.set(folio, group);
        }
        if (group.installments.some((installment) => installment.id === key)) continue;

        const paid = this.paidForInstallment(relation, item.id);
        const amount = Number(item.misvales_amount || 0);
        const relationOverdue = this.isOverdue(relation.financial_status);
        const status: InstallmentDisplayStatus =
          relation.financial_status === 'SETTLED'
            ? relationOverdue
              ? 'LATE_PAID'
              : 'PAID'
            : paid > 0
              ? 'PARTIAL'
              : relationOverdue
                ? selectedSettled && relation.cutoff_at !== selected.cutoff_at
                  ? 'LATE_PAID'
                  : 'OVERDUE'
                : 'PENDING';

        group.installments.push({
          id: key,
          number,
          total: Number(item.snapshot['total_installments'] || 0),
          clientAmount: Number(item.portfolio_amount || 0),
          misvalesAmount: amount,
          paid: status === 'LATE_PAID' && paid === 0 ? amount : paid,
          status,
        });
      }
    }

    return [...groups.values()].map((group) => {
      group.installments.sort((a, b) => a.number - b.number);
      group.clientTotal = group.installments.reduce((sum, item) => sum + item.misvalesAmount, 0);
      group.paidTotal = group.installments.reduce((sum, item) => sum + item.paid, 0);
      group.overdueTotal = group.installments
        .filter((item) => item.status === 'OVERDUE')
        .reduce((sum, item) => sum + item.misvalesAmount, 0);
      group.paidCount = group.installments.filter(
        (item) => item.status === 'PAID' || item.status === 'LATE_PAID',
      ).length;
      return group;
    });
  }

  installmentDisplayLabel(status: InstallmentDisplayStatus): string {
    return {
      PAID: 'Pagada',
      LATE_PAID: 'Pagada vencida',
      PARTIAL: 'Con abono',
      OVERDUE: 'Vencida',
      PENDING: 'Pendiente',
    }[status];
  }

  surplusForRelation(relationId: string): Surplus | null {
    return this.surpluses().find((item) => item.origin_relation_id === relationId) ?? null;
  }

  surplusesForRelation(relationId: string): Surplus[] {
    return this.surpluses().filter((item) => item.origin_relation_id === relationId);
  }

  surplusGroupForRelation(relationId: string): SurplusGroup | null {
    return groupSurpluses(this.surplusesForRelation(relationId))[0] ?? null;
  }

  totalSurplusForRelation(relationId: string): number {
    return this.surplusesForRelation(relationId).reduce(
      (total, item) => total + Number(item.available_amount || 0),
      0,
    );
  }

  originalSurplusForRelation(relationId: string): number {
    return this.surplusesForRelation(relationId).reduce(
      (total, item) => total + Number(item.original_amount || 0),
      0,
    );
  }

  surplusDecisionLabel(status: string): string {
    return (
      (
        {
          PENDING_DECISION: 'Pendiente de decisión',
          CREDIT_BALANCE: 'Elegido como saldo a favor',
          PARTIALLY_APPLIED: 'Saldo a favor aplicado parcialmente',
          CONSUMED: 'Saldo a favor aplicado',
          REFUND_PENDING: 'Devolución solicitada',
          REFUNDED: 'Devuelto',
          MIXED: 'Con movimientos en distintos estados',
        } as Record<string, string>
      )[status] ?? status
    );
  }

  paymentTransferred(payment: PaymentItem): number {
    return Number(payment.bank_movement?.amount ?? payment.amount ?? 0);
  }

  paymentSurplus(payment: PaymentItem): number {
    return Number(payment.bank_movement?.surplus_amount ?? 0);
  }

  surplusAvailable(surplus: Surplus): number {
    return Number(surplus.available_amount || 0);
  }

  transferredRefundAmount(surplus: Surplus): number {
    return (surplus.refund_requests ?? [])
      .filter((refund) => refund.status === 'EXECUTED')
      .reduce((total, refund) => total + Number(refund.execution_amount || refund.amount || 0), 0);
  }

  requestedRefundAmount(surplus: Surplus): number {
    return (surplus.refund_requests ?? [])
      .filter((refund) => ['PENDING', 'AUTHORIZED'].includes(refund.status))
      .reduce((total, refund) => total + Number(refund.amount || 0), 0);
  }

  openSurplusActions(surplus: SurplusGroup): void {
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
    this.surplusesApi.creditMany(surplus.member_ids).subscribe({
      next: () => this.finishSurplusAction('El excedente quedó registrado como saldo a favor.'),
      error: (response: HttpErrorResponse) => this.failSurplusAction(response),
    });
  }

  requestSurplusRefund(): void {
    const surplus = this.surplusAction();
    if (!surplus || this.surplusBusy()) return;
    this.surplusBusy.set(true);
    this.surplusesApi.refundMany(surplus.member_ids).subscribe({
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
    return this.session
      .permissions()
      .some((permission) =>
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
