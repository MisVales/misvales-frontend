import { describe, expect, it } from 'vitest';
import type { RefundRequest, Surplus } from './excedentes-api.service';
import { groupRefunds, groupSurpluses } from './surplus-group';

describe('surplus application grouping', () => {
  it('presents multiple payment excesses from one relation as one total', () => {
    const base = {
      distributor_id: 'distributor-1',
      branch_id: 'branch-1',
      origin_relation_id: 'relation-1',
      original_amount: '50.0000',
      available_amount: '50.0000',
      reserved_amount: '0.0000',
      status: 'PENDING_DECISION',
      applications: [],
      refund_requests: [],
      created_at: '2026-08-24T12:00:00Z',
    };
    const grouped = groupSurpluses([
      { ...base, id: 'surplus-1', bank_movement_id: 'movement-1', bank_folio: 'PAY-1' },
      { ...base, id: 'surplus-2', bank_movement_id: 'movement-2', bank_folio: 'PAY-2' },
    ] as Surplus[]);

    expect(grouped).toHaveLength(1);
    expect(grouped[0].available_amount).toBe('100.0000');
    expect(grouped[0].member_ids).toEqual(['surplus-1', 'surplus-2']);
    expect(grouped[0].movements).toHaveLength(2);
  });

  it('presents the related refund requests as one total for manager and cashier', () => {
    const grouped = groupRefunds([
      { id: 'refund-1', surplus_id: 'surplus-1', distributor_id: 'distributor-1', origin_relation_id: 'relation-1', branch_id: 'branch-1', amount: '50.0000', status: 'REQUESTED', created_at: '2026-08-24T12:00:00Z' },
      { id: 'refund-2', surplus_id: 'surplus-2', distributor_id: 'distributor-1', origin_relation_id: 'relation-1', branch_id: 'branch-1', amount: '50.0000', status: 'REQUESTED', created_at: '2026-08-24T12:00:01Z' },
    ] as RefundRequest[]);

    expect(grouped).toHaveLength(1);
    expect(grouped[0].amount).toBe('100.0000');
    expect(grouped[0].member_ids).toEqual(['refund-1', 'refund-2']);
  });
});
