import type { RefundRequest, Surplus, SurplusApplication } from './excedentes-api.service';

export interface SurplusGroup extends Omit<Surplus, 'id' | 'bank_movement_id' | 'bank_folio'> {
  id: string;
  member_ids: string[];
  movements: Array<{
    surplus_id: string;
    bank_movement_id: string;
    bank_folio?: string;
    amount: string;
    created_at: string;
  }>;
}

export interface RefundGroup extends RefundRequest {
  member_ids: string[];
  members: RefundRequest[];
}

export function groupSurpluses(items: readonly Surplus[]): SurplusGroup[] {
  const groups = new Map<string, Surplus[]>();

  for (const item of items) {
    const key = `${item.distributor_id}:${item.origin_relation_id}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return [...groups.entries()].map(([id, members]) => {
    const first = members[0];
    const statuses = [...new Set(members.map((item) => item.status))];

    return {
      ...first,
      id,
      member_ids: members.map((item) => item.id),
      original_amount: sumMoney(members, 'original_amount'),
      available_amount: sumMoney(members, 'available_amount'),
      reserved_amount: sumMoney(members, 'reserved_amount'),
      status: statuses.length === 1 ? statuses[0] : 'MIXED',
      applications: members.flatMap((item) => item.applications ?? []) as SurplusApplication[],
      refund_requests: members.flatMap((item) => item.refund_requests ?? []) as RefundRequest[],
      created_at: members
        .map((item) => item.created_at)
        .sort((left, right) => left.localeCompare(right))[0],
      movements: members.map((item) => ({
        surplus_id: item.id,
        bank_movement_id: item.bank_movement_id,
        bank_folio: item.bank_folio,
        amount: item.original_amount,
        created_at: item.created_at,
      })),
    };
  });
}

export function groupRefunds(items: readonly RefundRequest[]): RefundGroup[] {
  const groups = new Map<string, RefundRequest[]>();

  for (const item of items) {
    const key = `${item.distributor_id}:${item.origin_relation_id}:${item.status}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return [...groups.entries()].map(([id, members]) => ({
    ...members[0],
    id,
    member_ids: members.map((item) => item.id),
    members,
    amount: members.reduce((total, item) => total + Number(item.amount || 0), 0).toFixed(4),
    execution_amount: members
      .reduce((total, item) => total + Number(item.execution_amount || 0), 0)
      .toFixed(4),
    created_at: members
      .map((item) => item.created_at)
      .sort((left, right) => left.localeCompare(right))[0],
  }));
}

function sumMoney(items: readonly Surplus[], field: 'original_amount' | 'available_amount' | 'reserved_amount'): string {
  return items.reduce((total, item) => total + Number(item[field] || 0), 0).toFixed(4);
}
