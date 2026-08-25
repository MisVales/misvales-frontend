import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RealtimeSocketStore {
  private readonly socketIdState = signal<string | null>(null);

  readonly socketId = this.socketIdState.asReadonly();

  set(socketId: string | undefined): void {
    this.socketIdState.set(socketId || null);
  }

  clear(): void {
    this.socketIdState.set(null);
  }
}
