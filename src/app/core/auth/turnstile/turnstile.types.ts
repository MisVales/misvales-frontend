export type TurnstileTheme = 'auto' | 'light' | 'dark';
export type TurnstileSize = 'normal' | 'compact' | 'flexible';
export type TurnstileAppearance = 'always' | 'execute' | 'interaction-only';

export interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  cData?: string;
  callback?: (token: string) => void;
  'error-callback'?: (errorCode: string) => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
  theme?: TurnstileTheme;
  language?: string;
  tabindex?: number;
  'response-field'?: boolean;
  'response-field-name'?: string;
  size?: TurnstileSize;
  retry?: 'auto' | 'never';
  'retry-interval'?: number;
  'refresh-expired'?: 'auto' | 'manual' | 'never';
  'refresh-timeout'?: 'auto' | 'manual' | 'never';
  appearance?: TurnstileAppearance;
  execution?: 'render' | 'execute';
}

export interface TurnstileInstance {
  render(container: string | HTMLElement, options: TurnstileRenderOptions): string;
  reset(widgetId?: string): void;
  remove(widgetId: string): void;
  getResponse(widgetId?: string): string | undefined;
  isExpired(widgetId?: string): boolean;
  ready(callback: () => void): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
    onloadTurnstileCallback?: () => void;
  }
}
