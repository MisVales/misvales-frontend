import { FormControl, FormGroup } from '@angular/forms';

import { safeReturnUrl } from '@core/guards/return-url.util';
import { applyServerValidation } from '@shared/forms/server-validation.util';

import { createCommandContext, createCorrelationContext } from './api-request.context';
import { toHttpParams } from './query-params.util';

describe('API technical utilities', () => {
  it('omits empty query parameters and keeps exact names', () => {
    const params = toHttpParams({
      current_page: 2,
      filter: '',
      optional: null,
      active: false,
    });

    expect(params.keys()).toEqual(['current_page', 'active']);
    expect(params.get('current_page')).toBe('2');
    expect(params.get('active')).toBe('false');
  });

  it('creates a new command key only for a new logical command', () => {
    const first = createCommandContext({ idempotency: true });
    const second = createCommandContext({ idempotency: true });
    const withoutIdempotency = createCommandContext();

    expect(first.idempotencyKey).not.toBe(second.idempotencyKey);
    expect(withoutIdempotency.idempotencyKey).toBeNull();
    expect(createCorrelationContext().requestId).toBe(true);
  });

  it('maps server fields and preserves unassociated errors for the summary', () => {
    const form = new FormGroup({
      email: new FormControl('', { nonNullable: true }),
    });

    const result = applyServerValidation(form, {
      email: ['Correo inválido.'],
      general: ['Revisa la solicitud.'],
    });

    expect(form.controls.email.errors?.['server']).toEqual(['Correo inválido.']);
    expect(result.unassociated).toEqual({ general: ['Revisa la solicitud.'] });
  });

  it('accepts only internal return URLs from the authorized experience', () => {
    expect(safeReturnUrl('/tableta/visitas', 'tableta')).toBe('/tableta/visitas');
    expect(safeReturnUrl('/administrativa', 'tableta')).toBeNull();
    expect(safeReturnUrl('https://evil.test', 'tableta')).toBeNull();
    expect(safeReturnUrl('//evil.test', null)).toBeNull();
    expect(safeReturnUrl('/%2F%2Fevil.test', null)).toBeNull();
  });
});
