import { Injectable, computed, signal } from '@angular/core';

export type ApplicationExperience = 'administrativa' | 'distribuidora' | 'tableta';

export interface EffectiveAccess {
  readonly experience: ApplicationExperience;
  readonly permissions: ReadonlySet<string>;
}

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly accessState = signal<EffectiveAccess | null>(null);

  readonly access = this.accessState.asReadonly();
  readonly hasSession = computed(() => this.accessState() !== null);

  establish(access: EffectiveAccess): void {
    this.accessState.set({
      experience: access.experience,
      permissions: new Set(access.permissions),
    });
  }

  clear(): void {
    this.accessState.set(null);
  }

  hasPermission(permission: string): boolean {
    return this.accessState()?.permissions.has(permission) ?? false;
  }
}
