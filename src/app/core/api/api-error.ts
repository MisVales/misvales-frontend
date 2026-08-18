import { HttpErrorResponse } from '@angular/common/http';

export type ValidationErrorsByField = Readonly<Record<string, readonly string[]>>;

export interface NormalizedApiError {
  readonly status: number;
  readonly code: string;
  readonly message: string;
  readonly fields: ValidationErrorsByField;
  readonly details: Readonly<Record<string, unknown>>;
  readonly requestId: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function normalizeFields(value: unknown): ValidationErrorsByField {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([field, messages]) => {
      if (typeof messages === 'string') {
        return [[field, [messages]]];
      }

      if (Array.isArray(messages)) {
        const safeMessages = messages.filter(
          (message): message is string => typeof message === 'string',
        );
        return safeMessages.length ? [[field, safeMessages]] : [];
      }

      return [];
    }),
  );
}

export function normalizeApiError(
  error: unknown,
  fallbackCode = 'UNEXPECTED_ERROR',
  fallbackMessage = 'No fue posible completar la operación.',
): NormalizedApiError {
  const status = error instanceof HttpErrorResponse ? error.status : 0;
  const rawBody = error instanceof HttpErrorResponse ? error.error : error;
  const body = isRecord(rawBody) ? rawBody : {};
  const nested = isRecord(body['error']) ? body['error'] : {};

  const code =
    stringValue(nested['code']) ??
    stringValue(body['code']) ??
    stringValue(body['error']) ??
    fallbackCode;
  const message =
    stringValue(nested['message']) ?? stringValue(body['message']) ?? fallbackMessage;
  const fields = normalizeFields(nested['fields'] ?? body['fields'] ?? body['errors']);
  const detailsValue = nested['details'] ?? body['details'];
  const details = isRecord(detailsValue) ? detailsValue : {};
  const requestId = stringValue(nested['request_id']) ?? stringValue(body['request_id']);

  return { status, code, message, fields, details, requestId };
}

export function apiErrorCode(error: unknown, fallback: string): string {
  return normalizeApiError(error, fallback).code;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  return normalizeApiError(error, 'UNEXPECTED_ERROR', fallback).message;
}

export function apiValidationErrors(error: unknown): ValidationErrorsByField {
  return normalizeApiError(error).fields;
}
