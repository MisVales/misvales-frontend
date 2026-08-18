import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';
import { TurnstileInstance, TurnstileRenderOptions } from './turnstile.types';

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

@Injectable({
  providedIn: 'root'
})
export class TurnstileService {
  private readonly document = inject(DOCUMENT);
  private scriptLoadingPromise: Promise<TurnstileInstance> | null = null;

  get isEnabled(): boolean {
    const key = environment.turnstileSiteKey;
    return typeof key === 'string' && key.trim().length > 0;
  }

  get siteKey(): string {
    return (environment.turnstileSiteKey as string) || '';
  }

  loadScript(): Promise<TurnstileInstance> {
    if (!this.isEnabled) {
      return Promise.reject(new Error('Turnstile is disabled (no site key configured).'));
    }

    if (this.document.defaultView?.turnstile) {
      return Promise.resolve(this.document.defaultView.turnstile);
    }

    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise<TurnstileInstance>((resolve, reject) => {
      const windowObj = this.document.defaultView;
      if (!windowObj) {
        reject(new Error('Window object is not available.'));
        return;
      }

      // Check if script element already exists in DOM
      const existingScript = this.document.querySelector<HTMLScriptElement>(
        `script[src*="challenges.cloudflare.com/turnstile/v0/api.js"]`
      );

      if (existingScript) {
        const checkTurnstile = () => {
          if (windowObj.turnstile) {
            resolve(windowObj.turnstile);
          } else {
            setTimeout(checkTurnstile, 50);
          }
        };
        checkTurnstile();
        return;
      }

      const script = this.document.createElement('script');
      script.src = TURNSTILE_SCRIPT_URL;
      script.defer = true;
      script.async = true;

      script.onload = () => {
        const checkReady = () => {
          if (windowObj.turnstile) {
            resolve(windowObj.turnstile);
          } else {
            setTimeout(checkReady, 50);
          }
        };
        checkReady();
      };

      script.onerror = () => {
        this.scriptLoadingPromise = null;
        script.remove();
        reject(new Error('Failed to load Cloudflare Turnstile script.'));
      };

      this.document.head.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  async render(container: HTMLElement | string, options: TurnstileRenderOptions): Promise<string> {
    const turnstile = await this.loadScript();
    return turnstile.render(container, options);
  }

  reset(widgetId?: string): void {
    const windowObj = this.document.defaultView;
    if (windowObj?.turnstile) {
      try {
        windowObj.turnstile.reset(widgetId);
      } catch (err) {
        console.warn('Turnstile reset warning:', err);
      }
    }
  }

  remove(widgetId: string): void {
    const windowObj = this.document.defaultView;
    if (windowObj?.turnstile && widgetId) {
      try {
        windowObj.turnstile.remove(widgetId);
      } catch (err) {
        console.warn('Turnstile remove warning:', err);
      }
    }
  }

  getResponse(widgetId?: string): string | undefined {
    const windowObj = this.document.defaultView;
    return windowObj?.turnstile?.getResponse(widgetId);
  }

  isExpired(widgetId?: string): boolean {
    const windowObj = this.document.defaultView;
    return windowObj?.turnstile?.isExpired(widgetId) ?? false;
  }
}
