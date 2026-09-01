import { describe, expect, it } from 'vitest';
import {
  canExportBankSimulation,
  canUploadBankFile,
  canViewBankImports,
  canViewBranchReconciliation,
  canViewGlobalReconciliation,
} from './reconciliation-access';

const cashierScope = [
  {
    role: 'cashier',
    roleName: 'Cajera',
    branchId: 'branch-1',
    permissions: ['bank_imports.create_branch', 'bank_imports.view_branch'],
  },
];

describe('reconciliation access', () => {
  it('distinguishes global and branch viewers', () => {
    expect(canViewGlobalReconciliation(['bank_movements.view_global'])).toBe(true);
    expect(canViewBranchReconciliation(['bank_movements.view_branch'])).toBe(true);
    expect(canViewGlobalReconciliation(['bank_movements.view_branch'])).toBe(false);
  });

  it('allows upload only for a cashier with an active branch scope', () => {
    expect(
      canUploadBankFile(['cashier'], ['bank_imports.create_branch'], 'branch-1', cashierScope),
    ).toBe(true);
    expect(
      canUploadBankFile(
        ['general_manager'],
        ['bank_imports.create_branch'],
        'branch-1',
        cashierScope,
      ),
    ).toBe(false);
    expect(canUploadBankFile(['cashier'], ['bank_imports.create_branch'], null, cashierScope)).toBe(
      false,
    );
  });

  it('allows global exports without inventing a branch', () => {
    expect(canExportBankSimulation(['bank_imports.view_global'], null, [])).toBe(true);
    expect(canExportBankSimulation(['bank_imports.view_branch'], 'branch-1', cashierScope)).toBe(
      true,
    );
    expect(canExportBankSimulation(['bank_imports.view_branch'], null, cashierScope)).toBe(false);
  });

  it('recognizes import history permissions', () => {
    expect(canViewBankImports(['bank_imports.view_global'])).toBe(true);
    expect(canViewBankImports(['bank_imports.view_branch'])).toBe(true);
    expect(canViewBankImports(['bank_movements.view_global'])).toBe(false);
  });
});
