import { Injectable, signal } from '@angular/core';
import type { DistributorWorkspaceSection } from './distributor-workspace-nav.component';

export interface DistributorWorkspaceContext {
  distributorId: string | null;
  distributorNumber: string;
  active: DistributorWorkspaceSection;
  backRoute: string;
}

@Injectable({ providedIn: 'root' })
export class DistributorWorkspaceContextService {
  readonly current = signal<DistributorWorkspaceContext | null>(null);
  private owner: object | null = null;

  set(owner: object, context: DistributorWorkspaceContext): void {
    this.owner = owner;
    this.current.set(context);
  }

  clear(owner: object): void {
    if (this.owner !== owner) return;
    this.owner = null;
    this.current.set(null);
  }
}
