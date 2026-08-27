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
