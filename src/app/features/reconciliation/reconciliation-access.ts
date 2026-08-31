import type { SessionScope } from '../../core/session/session.store';

function hasPermission(permissions: readonly string[], permission: string): boolean {
  return permissions.includes('all') || permissions.includes(permission);
}

export function canViewGlobalReconciliation(permissions: readonly string[]): boolean {
  return (
    hasPermission(permissions, 'bank_imports.view_global') ||
    hasPermission(permissions, 'bank_movements.view_global')
  );
}

export function canViewBranchReconciliation(permissions: readonly string[]): boolean {
  return (
    hasPermission(permissions, 'bank_imports.view_branch') ||
    hasPermission(permissions, 'bank_movements.view_branch')
  );
}

export function canViewBankImports(permissions: readonly string[]): boolean {
  return (
    hasPermission(permissions, 'bank_imports.view_global') ||
    hasPermission(permissions, 'bank_imports.view_branch') ||
    hasPermission(permissions, 'bank_imports.create_branch')
  );
}

export function canUploadBankFile(
  roles: readonly string[],
  permissions: readonly string[],
  activeBranch: string | null,
  scopes: readonly SessionScope[],
): boolean {
  if (!roles.includes('cashier') || !hasPermission(permissions, 'bank_imports.create_branch')) {
    return false;
  }

  return (
    activeBranch !== null &&
    scopes.some((scope) => scope.role === 'cashier' && scope.branchId === activeBranch)
  );
}

export function canExportBankSimulation(
  permissions: readonly string[],
  activeBranch: string | null,
  scopes: readonly SessionScope[],
): boolean {
  if (hasPermission(permissions, 'bank_imports.view_global')) {
    return true;
  }

  return (
    activeBranch !== null &&
    hasPermission(permissions, 'bank_imports.view_branch') &&
    scopes.some((scope) => scope.branchId === activeBranch)
  );
}
