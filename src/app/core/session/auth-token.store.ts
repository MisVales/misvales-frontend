import { Injectable, signal } from '@angular/core';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/** Tokens opacos mantenidos exclusivamente en memoria. */
@Injectable({ providedIn: 'root' })
export class AuthTokenStore {
  private readonly tokensState = signal<AuthTokens | null>(null);

  readonly tokens = this.tokensState.asReadonly();

  set(accessToken: string, refreshToken: string, expiresInSeconds: number): void {
    this.tokensState.set({
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    });
  }

  accessToken(): string | null {
    const tokens = this.tokensState();
    if (!tokens || tokens.expiresAt <= Date.now()) {
      this.clear();
      return null;
    }
    return tokens.accessToken;
  }

  clear(): void {
    this.tokensState.set(null);
  }
}
