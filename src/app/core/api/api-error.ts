import { HttpErrorResponse } from '@angular/common/http';

export type ValidationErrorsByField = Readonly<Record<string, readonly string[]>>;

interface ApiErrorBody {
  error?: string;
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

function bodyFrom(error: unknown): ApiErrorBody {
  if (!(error instanceof HttpErrorResponse) || typeof error.error !== 'object' || !error.error) {
    return {};
  }
  return error.error as ApiErrorBody;
}

export function apiErrorCode(error: unknown, fallback: string): string {
  const body = bodyFrom(error);
  return body.error ?? body.code ?? fallback;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  return bodyFrom(error).message ?? fallback;
}

export function apiValidationErrors(error: unknown): ValidationErrorsByField {
  return bodyFrom(error).errors ?? {};
}
