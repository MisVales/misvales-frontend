import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StrictNumberInputDirective } from '../../../shared/directives/strict-number-input.directive';
import { PaymentItem, RelacionesApiService, RelationView } from '../data-access/relaciones-api.service';

interface PaymentPercentages {
  surcharge: number;
  interest: number;
  insurance: number;
  commission: number;
  capital: number;
}

interface SimulationOutput {
  surchargeApplied: number;
  interestApplied: number;
  insuranceApplied: number;
  commissionApplied: number;
  capitalApplied: number;
  lineRecovered: number;
  projectedUsedBalance: number;
  projectedAvailable: number;
}

@Component({
  selector: 'app-pagos-page',
  imports: [CommonModule, FormsModule, StrictNumberInputDirective],
  templateUrl: './pagos-page.component.html',
  styleUrl: './pagos-page.component.css',
})
export class PagosPageComponent {
  private readonly api = inject(RelacionesApiService);

  readonly relations = signal<RelationView[]>([]);
  readonly selectedRelationId = signal<string | null>(null);
  readonly selectedRelation = signal<RelationView | null>(null);
  readonly searchTerm = signal<string>('');
  readonly statusFilter = signal<string>('');
  readonly simulatedAmount = signal<number>(0);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');

  readonly filteredRelations = computed(() => {
    const list = this.relations();
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();

    return list.filter((item) => {
      const matchSearch =
        !search ||
        item.payment_reference.toLowerCase().includes(search) ||
        (item.header_snapshot?.name && item.header_snapshot.name.toLowerCase().includes(search)) ||
        (item.distribuidora?.usuario?.name && item.distribuidora.usuario.name.toLowerCase().includes(search)) ||
        (item.distribuidora?.distributor_number && item.distribuidora.distributor_number.toLowerCase().includes(search));

      const matchStatus = !status || item.financial_status === status;

      return matchSearch && matchStatus;
    });
  });

  readonly metrics = computed(() => {
    const all = this.relations();
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

    const usedPercentage = totalAuthorized > 0 ? Math.min(100, (usedBalance / totalAuthorized) * 100) : 0;
    const availablePercentage = Math.max(0, 100 - usedPercentage);

    return {
      totalAuthorized,
      usedBalance,
      available,
      usedPercentage,
      availablePercentage,
    };
  });

  readonly simulationResult = computed<SimulationOutput | null>(() => {
    const rel = this.selectedRelation();
    const amount = Number(this.simulatedAmount());
    if (!rel || amount <= 0) {
      return null;
    }

    let available = Math.min(amount, parseFloat(rel.balance || '0'));
    const totalAuthorized = this.creditLine().totalAuthorized;
    const usedBalance = this.creditLine().usedBalance;

    // 1. Surcharge pending
    const surchargeTotal = parseFloat(rel.surcharge_total || '0');
    let surchargePaid = 0;
    if (rel.pagos) {
      for (const p of rel.pagos) {
        surchargePaid += parseFloat(p.surcharge_applied || '0');
      }
    }
    const surchargePending = Math.max(0, surchargeTotal - surchargePaid);
    const surchargeApplied = Math.min(available, surchargePending);
    available -= surchargeApplied;

    // 2-5. Interest, Insurance, Commission, Capital across partidas
    let interestPending = 0;
    let insurancePending = 0;
    let commissionPending = 0;
    let capitalPending = 0;

    if (rel.partidas && rel.partidas.length > 0) {
      for (const item of rel.partidas) {
        interestPending += parseFloat((item.snapshot['interest'] ?? 0).toString());
        insurancePending += parseFloat((item.snapshot['insurance'] ?? 0).toString());
        commissionPending += parseFloat((item.snapshot['loan_commission'] ?? 0).toString());
        capitalPending += parseFloat((item.snapshot['capital'] ?? 0).toString());
      }
    } else {
      const remainingForRest = Math.max(0, parseFloat(rel.balance || '0') - surchargePending);
      capitalPending = remainingForRest * 0.7;
      interestPending = remainingForRest * 0.15;
      insurancePending = remainingForRest * 0.05;
      commissionPending = remainingForRest * 0.1;
    }

    // Subtract already paid
    if (rel.pagos) {
      for (const p of rel.pagos) {
        interestPending = Math.max(0, interestPending - parseFloat(p.interest_applied || '0'));
        insurancePending = Math.max(0, insurancePending - parseFloat(p.insurance_applied || '0'));
        commissionPending = Math.max(0, commissionPending - parseFloat(p.commission_applied || '0'));
        capitalPending = Math.max(0, capitalPending - parseFloat(p.capital_applied || '0'));
      }
    }

    const interestApplied = Math.min(available, interestPending);
    available -= interestApplied;

    const insuranceApplied = Math.min(available, insurancePending);
    available -= insuranceApplied;

    const commissionApplied = Math.min(available, commissionPending);
    available -= commissionApplied;

    const capitalApplied = Math.min(available, capitalPending);
    available -= capitalApplied;

    // Line recovered is strictly capital applied and cannot exceed used balance
    const lineRecovered = Math.min(capitalApplied, usedBalance);
    const projectedUsedBalance = Math.max(0, usedBalance - lineRecovered);
    const projectedAvailable = Math.min(totalAuthorized, totalAuthorized - projectedUsedBalance);

    return {
      surchargeApplied,
      interestApplied,
      insuranceApplied,
      commissionApplied,
      capitalApplied,
      lineRecovered,
      projectedUsedBalance,
      projectedAvailable,
    };
  });

  constructor() {
    this.loadRelations();
  }

  loadRelations(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.list({ per_page: 50 }).subscribe({
      next: (items) => {
        this.relations.set(items.data);
        this.loading.set(false);
        if (items.data.length > 0 && !this.selectedRelationId()) {
          this.selectRelation(items.data[0].id);
        }
      },
      error: () => {
        this.error.set('No fue posible cargar las relaciones y pagos.');
        this.loading.set(false);
      },
    });
  }

  selectRelation(id: string): void {
    this.selectedRelationId.set(id);
    this.api.detail(id).subscribe({
      next: (detail) => {
        this.selectedRelation.set(detail);
        this.simulatedAmount.set(parseFloat(detail.balance || '0'));
      },
      error: () => {
        this.error.set('No fue posible obtener el detalle de la relación.');
      },
    });
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
}
