import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import {
  apiErrorCode,
  apiErrorMessage,
  apiValidationErrors,
  normalizeApiError,
} from './api-error';

describe('normalizeApiError', () => {
  it('normalizes the canonical nested API error contract', () => {
    const normalized = normalizeApiError(
      new HttpErrorResponse({
        status: 422,
        error: {
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Revisa los campos indicados.',
            fields: { email: ['El correo no es válido.'] },
            details: { retryable: false },
            request_id: 'request-123',
          },
        },
      }),
    );

    expect(normalized).toEqual({
      status: 422,
      code: 'VALIDATION_FAILED',
      message: 'Revisa los campos indicados.',
      fields: { email: ['El correo no es válido.'] },
      details: { retryable: false },
      requestId: 'request-123',
    });
  });

  it('keeps compatibility with legacy flat errors and filters unsafe field shapes', () => {
    const error = new HttpErrorResponse({
      status: 422,
      error: {
        error: 'INVALID_INPUT',
        message: 'Datos inválidos.',
        errors: { name: 'Es requerido.', ignored: { internal: true } },
      },
    });

    expect(apiErrorCode(error, 'FALLBACK')).toBe('INVALID_INPUT');
    expect(apiErrorMessage(error, 'Fallback')).toBe('Datos inválidos.');
    expect(apiValidationErrors(error)).toEqual({ name: ['Es requerido.'] });
  });

  it('uses safe fallbacks for non-contract responses', () => {
    const normalized = normalizeApiError('upstream failure', 'SAFE_CODE', 'Mensaje seguro.');

    expect(normalized.code).toBe('SAFE_CODE');
    expect(normalized.message).toBe('Mensaje seguro.');
    expect(normalized.fields).toEqual({});
    expect(normalized.requestId).toBeNull();
  });
});
