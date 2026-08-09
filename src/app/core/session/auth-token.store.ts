import { Injectable, signal } from '@angular/core';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const STORAGE_KEY = 'auth_tokens';

/** Tokens mantenidos en memoria y localStorage para persistencia entre recargas. */
@Injectable({ providedIn: 'root' })
export class AuthTokenStore {
  private readonly tokensState = signal<AuthTokens | null>(this.loadFromStorage());

  readonly tokens = this.tokensState.asReadonly();

  private loadFromStorage(): AuthTokens | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored) as AuthTokens;
      if (parsed.expiresAt <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  set(accessToken: string, refreshToken: string, expiresInSeconds: number): void {
    const tokens: AuthTokens = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    };
    this.tokensState.set(tokens);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
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
    localStorage.removeItem(STORAGE_KEY);
  }
}
