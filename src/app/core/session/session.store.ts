import { Injectable, computed, signal } from '@angular/core';

export type ApplicationExperience = 'administrativa' | 'distribuidora' | 'tableta';

export type RoleCode =
  | 'ADMINISTRATOR'
  | 'CASHIER'
  | 'COORDINATOR'
  | 'DISTRIBUTOR'
  | 'GENERAL_MANAGER'
  | 'SUCURSAL_MANAGER'
  | 'VERIFIER';

export interface SessionIdentity {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly status: string;
}

export interface EffectiveAccess {
  readonly experience: ApplicationExperience;
  readonly permissions: ReadonlySet<string>;
  readonly role?: RoleCode;
  readonly scopeType?: 'BRANCH' | 'GLOBAL';
  readonly branchId?: string | null;
  readonly identity?: SessionIdentity;
  readonly sessionId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly accessState = signal<EffectiveAccess | null>(null);
  private readonly cleanupCallbacks = new Set<() => void>();

  readonly access = this.accessState.asReadonly();
  readonly hasSession = computed(() => this.accessState() !== null);

  establish(access: EffectiveAccess): void {
    this.accessState.set({
      experience: access.experience,
      permissions: new Set(access.permissions),
      role: access.role,
      scopeType: access.scopeType,
      branchId: access.branchId,
      identity: access.identity,
      sessionId: access.sessionId,
    });
  }

  clear(): void {
    this.accessState.set(null);
    for (const cleanup of this.cleanupCallbacks) cleanup();
  }

  registerCleanup(cleanup: () => void): void {
    this.cleanupCallbacks.add(cleanup);
  }

  hasPermission(permission: string): boolean {
    return this.accessState()?.permissions.has(permission) ?? false;
  }
}
