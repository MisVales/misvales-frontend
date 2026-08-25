import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';

interface AuthConfigurationResponse {
  turnstile: { enabled: boolean; site_key: string };
  diagnostics?: { debug: boolean };
}

let runtimeDebug = false;

export function runtimeDebugEnabled(): boolean {
  return runtimeDebug;
}

@Injectable({ providedIn: 'root' })
export class AuthConfigurationService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);
  private readonly turnstile = signal({ enabled: false, siteKey: '' });
  private readonly debug = signal(false);

  readonly turnstileConfiguration = this.turnstile.asReadonly();
  readonly debugEnabled = this.debug.asReadonly();

  log(event: string, context: Readonly<Record<string, unknown>> = {}): void {
    if (runtimeDebug) console.info(`[MisVales] ${event}`, context);
  }

  async load(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<AuthConfigurationResponse>(`${this.api.baseUrl}/auth/configuration`),
      );
      this.turnstile.set({
        enabled: response.turnstile.enabled,
        siteKey: response.turnstile.site_key,
      });
      this.debug.set(Boolean(response.diagnostics?.debug));
      runtimeDebug = Boolean(response.diagnostics?.debug);
    } catch {
      // La aplicación debe arrancar aun cuando el endpoint público de configuración esté degradado.
      this.turnstile.set({ enabled: false, siteKey: '' });
      this.debug.set(false);
      runtimeDebug = false;
    }
  }
}
