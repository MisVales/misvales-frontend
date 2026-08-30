import { describe, expect, it } from 'vitest';
import type { Surplus } from '../data-access/excedentes-api.service';
import type { PaymentItem } from '../../relations/data-access/relaciones-api.service';
import { PagosPageComponent } from './pagos-page.component';

describe('PagosPageComponent surplus presentation', () => {
  const component = Object.create(PagosPageComponent.prototype) as PagosPageComponent;

  it('preserves the transferred refund amount when available balance is zero', () => {
    const surplus = {
      available_amount: '0.0000',
      refund_requests: [
        {
          id: 'refund-1',
          surplus_id: 'surplus-1',
          amount: '100.0000',
          execution_amount: '100.0000',
          status: 'EXECUTED',
          branch_id: 'branch-1',
          created_at: '2026-08-24T12:00:00Z',
        },
      ],
    } as Surplus;

    expect(component.surplusAvailable(surplus)).toBe(0);
    expect(component.transferredRefundAmount(surplus)).toBe(100);
    expect(component.requestedRefundAmount(surplus)).toBe(0);
  });

  it('distinguishes transferred, applied and surplus amounts', () => {
    const payment = {
      amount: '0.0000',
      bank_movement: {
        amount: '50.0000',
        applied_amount: '0.0000',
        surplus_amount: '50.0000',
        bank_folio: 'BANK-2',
      },
    } as PaymentItem;

    expect(component.paymentTransferred(payment)).toBe(50);
    expect(component.paymentSurplus(payment)).toBe(50);
  });

  it('presents two credit-balance contributions as one application payment', () => {
    const relation = {
      id: 'relation-1',
      pagos: [
        {
          id: 'payment-1',
          source_type: 'CREDIT_BALANCE',
          amount: '50.0000',
          applied_at: '2026-08-24T13:57:00Z',
          surcharge_applied: '0',
          interest_applied: '0',
          insurance_applied: '0',
          commission_applied: '0',
          capital_applied: '50',
          line_recovered: '50',
        },
        {
          id: 'payment-2',
          source_type: 'CREDIT_BALANCE',
          amount: '50.0000',
          applied_at: '2026-08-24T13:57:01Z',
          surcharge_applied: '0',
          interest_applied: '0',
          insurance_applied: '0',
          commission_applied: '0',
          capital_applied: '50',
          line_recovered: '50',
        },
      ],
    } as never;

    const payments = component.paymentsForRelation(relation);

    expect(payments).toHaveLength(1);
    expect(payments[0].amount).toBe('100.0000');
    expect(payments[0].capital_applied).toBe('100.0000');
    expect(payments[0].id).toBe('credit-balance:relation-1');
  });

  it('separates inherited debt from the current installments and earned points', () => {
    const relation = {
      id: 'relation-2',
      misvales_total: '9647.0000',
      carried_balance: '8415.0000',
      reconciled_total: '9647.0000',
      balance: '0.0000',
      puntos_ganados: [{ id: 'points-1', points: 15 }],
      pagos: [
        {
          id: 'payment-1',
          amount: '9647.0000',
          applied_at: '2026-08-24T22:52:00Z',
          asignaciones: [
            {
              id: 'allocation-1',
              relation_item_id: 'item-1',
              component: 'CAPITAL',
              amount: '1232.0000',
            },
          ],
        },
      ],
    } as never;

    expect(component.relationMoneyRoute(relation)).toEqual({
      inherited: 8415,
      current: 1232,
      currentClientCollection: 0,
      currentDistributorProfit: 0,
      accumulatedSurcharges: 0,
      inheritedPaid: 8415,
      currentPaid: 1232,
      outstanding: 0,
      points: 15,
    });
  });

  it('explica el total del sexto corte con neto, ganancia y recargos separados', () => {
    const relation = {
      id: 'relation-six',
      cutoff_at: '2026-12-26T00:05:00Z',
      financial_status: 'OVERDUE',
      misvales_total: '24132.0000',
      carried_balance: '18696.0000',
      reconciled_total: '0.0000',
      balance: '24432.0000',
      surcharge_total: '1800.0000',
      partidas: [
        { portfolio_amount: '1887.0000', misvales_amount: '1812.0000', snapshot: {} },
        { portfolio_amount: '2825.0000', misvales_amount: '2712.0000', snapshot: {} },
        { portfolio_amount: '950.0000', misvales_amount: '912.0000', snapshot: {} },
      ],
      pagos: [],
    } as never;

    expect(component.relationMoneyRoute(relation)).toMatchObject({
      inherited: 18696,
      current: 5436,
      currentClientCollection: 5662,
      currentDistributorProfit: 226,
      accumulatedSurcharges: 1800,
      outstanding: 24432,
    });
  });

  it('conserva el total generado y usa el balance exigible despues de recargos', () => {
    const relation = {
      id: 'relation-overdue',
      financial_status: 'OVERDUE',
      misvales_total: '41407.0000',
      carried_balance: '36796.0000',
      carried_surcharge: '4800.0000',
      reconciled_total: '0.0000',
      surcharge_total: '6000.0000',
      balance: '42607.0000',
      partidas: [{ portfolio_amount: '4611.0000', misvales_amount: '4611.0000', snapshot: {} }],
      pagos: [],
    } as never;

    expect(component.relationMoneyRoute(relation)).toMatchObject({
      current: 4611,
      accumulatedSurcharges: 6000,
      outstanding: 42607,
    });
  });

  it('separa cobro, comisión y deuda de MisVales, incluyendo el acumulado por parcialidad', () => {
    const firstRelation = {
      id: 'relation-1',
      distributor_id: 'distributor-1',
      cutoff_at: '2026-08-15T00:00:00Z',
      financial_status: 'OVERDUE',
      partidas: [
        {
          id: 'item-1',
          portfolio_amount: '950.0000',
          misvales_amount: '912.0000',
          snapshot: { folio: 'VAL-1', installment: 1, total_installments: 8, distributor_profit: '38.0000' },
        },
      ],
      pagos: [],
    } as never;
    const selectedRelation = {
      id: 'relation-2',
      distributor_id: 'distributor-1',
      cutoff_at: '2026-08-30T00:00:00Z',
      financial_status: 'OVERDUE',
      partidas: [
        {
          id: 'item-2',
          portfolio_amount: '950.0000',
          misvales_amount: '912.0000',
          snapshot: { folio: 'VAL-1', installment: 2, total_installments: 8, distributor_profit: '38.0000' },
        },
      ],
      pagos: [],
    } as never;
    (component as any).relations = () => [firstRelation, selectedRelation];

    const [voucher] = component.groupedInstallments(selectedRelation);

    expect(voucher.misvalesTotal).toBe(1824);
    expect(voucher.distributorProfit).toBe(76);
    expect(voucher.installments[1]).toMatchObject({
      accumulatedClientAmount: 1900,
      accumulatedDistributorProfit: 76,
      accumulatedMisvalesAmount: 1824,
      accumulatedOutstanding: 1824,
    });
  });

  it('conserva 8/8 y cada ocurrencia terminal como registros distintos en orden', () => {
    const normalRelations = Array.from({ length: 8 }, (_, index) => ({
      id: `relation-${index + 1}`,
      distributor_id: 'distributor-1',
      cutoff_at: `2026-${String(index + 1).padStart(2, '0')}-15T00:00:00Z`,
      financial_status: 'OVERDUE',
      partidas: [
        {
          id: `installment-${index + 1}`,
          occurrence_type: 'INSTALLMENT',
          portfolio_amount: '1887.0000',
          misvales_amount: '1812.0000',
          snapshot: {
            folio: 'VAL-MARIA',
            client: 'María',
            product: '8-10000',
            installment: index + 1,
            total_installments: 8,
            distributor_profit: '75.0000',
          },
        },
      ],
      pagos: [],
    }));
    const firstTerminal = {
      id: 'relation-9',
      distributor_id: 'distributor-1',
      cutoff_at: '2026-09-15T00:00:00Z',
      financial_status: 'OVERDUE',
      partidas: [
        {
          id: 'terminal-1',
          occurrence_type: 'TERMINAL_OVERDUE',
          terminal_sequence: 1,
          portfolio_amount: '75.0000',
          misvales_amount: '75.0000',
          snapshot: {
            folio: 'VAL-MARIA',
            client: 'María',
            product: '8-10000',
            installment: 8,
            total_installments: 8,
            terminal_sequence: 1,
            terminal_charge: '75.0000',
            distributor_profit: '75.0000',
          },
        },
      ],
      pagos: [],
    };
    const mariaProgression = [1812, 3999, 6186, 8373, 10560, 12747, 14934, 17121];
    (firstTerminal as any).voucher_summaries = [{
      voucher_id: 'voucher-maria',
      folio: 'VAL-MARIA',
      client: 'MarÃ­a',
      product: '8-10000',
      total_installments: 8,
      cumulative_misvales_due: '17496.0000',
      cumulative_surcharge: '2400.0000',
      cumulative_forfeited_profit: '525.0000',
      occurrences: [
        ...normalRelations.map((relation, index) => ({
          relation_id: relation.id,
          relation_item_id: relation.partidas[0].id,
          occurrence_type: 'INSTALLMENT',
          installment: index + 1,
          total_installments: 8,
          terminal_sequence: null,
          cumulative_misvales_due: `${mariaProgression[index]}.0000`,
          cumulative_surcharge: `${Math.max(0, index) * 300}.0000`,
          cumulative_forfeited_profit: `${Math.max(0, index) * 75}.0000`,
        })),
        {
          relation_id: firstTerminal.id,
          relation_item_id: 'terminal-1',
          occurrence_type: 'TERMINAL_OVERDUE',
          installment: 8,
          total_installments: 8,
          terminal_sequence: 1,
          cumulative_misvales_due: '17496.0000',
          cumulative_surcharge: '2400.0000',
          cumulative_forfeited_profit: '525.0000',
        },
      ],
    }];
    const secondTerminal = {
      ...firstTerminal,
      id: 'relation-10',
      cutoff_at: '2026-10-15T00:00:00Z',
      partidas: [
        {
          ...firstTerminal.partidas[0],
          id: 'terminal-2',
          terminal_sequence: 2,
          snapshot: { ...firstTerminal.partidas[0].snapshot, terminal_sequence: 2 },
        },
      ],
    };
    (secondTerminal as any).voucher_summaries = [{
      ...(firstTerminal as any).voucher_summaries[0],
      cumulative_misvales_due: '17871.0000',
      cumulative_surcharge: '2700.0000',
      occurrences: [
        ...(firstTerminal as any).voucher_summaries[0].occurrences,
        {
          relation_id: secondTerminal.id,
          relation_item_id: 'terminal-2',
          occurrence_type: 'TERMINAL_OVERDUE',
          installment: 8,
          total_installments: 8,
          terminal_sequence: 2,
          cumulative_misvales_due: '17871.0000',
          cumulative_surcharge: '2700.0000',
          cumulative_forfeited_profit: '525.0000',
        },
      ],
    }];

    (component as any).relations = () => [firstTerminal, ...[...normalRelations].reverse()];
    const [withFirstTerminal] = component.groupedInstallments(firstTerminal as never);

    expect(withFirstTerminal.installments).toHaveLength(9);
    expect(withFirstTerminal.installments.map((item) => item.shortLabel)).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '*8',
    ]);
    expect(withFirstTerminal.installments.slice(-2).map((item) => item.label)).toEqual(['8/8', '*8/8']);
    expect(withFirstTerminal.clientTotal).toBe(15171);
    expect(withFirstTerminal.installments.map((item) => item.accumulatedOutstanding)).toEqual([
      1812, 3999, 6186, 8373, 10560, 12747, 14934, 17121, 17496,
    ]);
    expect(withFirstTerminal.misvalesTotal).toBe(17496);
    expect(withFirstTerminal.distributorProfit).toBe(600);

    (component as any).relations = () => [
      secondTerminal,
      firstTerminal,
      ...[...normalRelations].reverse(),
    ];
    const [withSecondTerminal] = component.groupedInstallments(secondTerminal as never);

    expect(withSecondTerminal.installments).toHaveLength(10);
    expect(withSecondTerminal.installments.map((item) => item.shortLabel)).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '*8', '*8',
    ]);
    expect(withSecondTerminal.installments.slice(-3).map((item) => item.label)).toEqual([
      '8/8', '*8/8', '*8/8',
    ]);
    expect(withSecondTerminal.installments.slice(-2).map((item) => item.terminalSequence)).toEqual([1, 2]);
    expect(new Set(withSecondTerminal.installments.map((item) => item.id)).size).toBe(10);
    expect(withSecondTerminal.clientTotal).toBe(15246);
    expect(withSecondTerminal.installments.at(-1)?.accumulatedOutstanding).toBe(17871);
    expect(withSecondTerminal.misvalesTotal).toBe(17871);
    expect(withSecondTerminal.distributorProfit).toBe(600);
  });

  it('does not infer inherited debt from allocation rounding differences', () => {
    const relation = {
      id: 'relation-3',
      misvales_total: '1232.0000',
      carried_balance: '0.0000',
      balance: '0.0000',
      pagos: [
        {
          id: 'payment-2',
          amount: '1232.0000',
          asignaciones: [{ relation_item_id: 'item-2', amount: '1230.0000' }],
        },
      ],
    } as never;

    expect(component.relationMoneyRoute(relation)).toMatchObject({
      inherited: 0,
      inheritedPaid: 0,
      currentPaid: 1232,
    });
  });
});
