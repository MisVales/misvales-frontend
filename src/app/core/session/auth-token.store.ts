import { Injectable, signal } from '@angular/core';

export interface AuthTokens {
  accessToken: string;
  expiresAt: number;
}

/** El access token vive solo en memoria; el refresh token es una cookie HttpOnly. */
@Injectable({ providedIn: 'root' })
export class AuthTokenStore {
  private readonly tokensState = signal<AuthTokens | null>(null);

  readonly tokens = this.tokensState.asReadonly();

  constructor() {
    // Los tokens no se persisten. La guardia adicional permite ejecutar la
    // aplicación y sus pruebas en entornos donde localStorage es un shim.
    const storage = globalThis.localStorage;
    if (typeof storage?.removeItem === 'function') {
      storage.removeItem('auth_tokens');
    }
  }

  set(accessToken: string, expiresInSeconds: number): void {
    const tokens: AuthTokens = {
      accessToken,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    };
    this.tokensState.set(tokens);
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
