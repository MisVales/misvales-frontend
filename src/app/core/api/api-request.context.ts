import { HttpContext, HttpContextToken } from '@angular/common/http';

export interface CorrelationContext {
  readonly requestId: boolean;
  readonly traceId: string | null;
}

export interface CommandContext {
  readonly idempotencyKey: string | null;
  readonly ifMatch: string | null;
}

export const INTERNAL_API_REQUEST = new HttpContextToken<boolean>(() => false);
export const CORRELATION_CONTEXT = new HttpContextToken<CorrelationContext>(() => ({
  requestId: false,
  traceId: null,
}));
export const COMMAND_CONTEXT = new HttpContextToken<CommandContext>(() => ({
  idempotencyKey: null,
  ifMatch: null,
}));
export const RETRY_GET_ONCE = new HttpContextToken<boolean>(() => true);
export const NETWORK_RETRY_PERFORMED = new HttpContextToken<boolean>(() => false);
export const CSRF_RETRY_PERFORMED = new HttpContextToken<boolean>(() => false);

export function internalApiContext(): HttpContext {
  return new HttpContext().set(INTERNAL_API_REQUEST, true);
}

export function createCorrelationContext(traceId: string | null = null): CorrelationContext {
  return {
    requestId: true,
    traceId,
  };
}

export function createCommandContext(
  options: { readonly idempotency?: boolean; readonly ifMatch?: string } = {},
): CommandContext {
  return {
    idempotencyKey: options.idempotency ? crypto.randomUUID() : null,
    ifMatch: options.ifMatch ?? null,
  };
}
