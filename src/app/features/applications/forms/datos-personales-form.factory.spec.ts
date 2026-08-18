import { FormBuilder } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { DatosPersonalesFormFactory } from './datos-personales-form.factory';

describe('DatosPersonalesFormFactory', () => {
  it('does not invalidate a Mexican application when the hidden identification country is null', () => {
    const form = DatosPersonalesFormFactory.create(new FormBuilder());

    form.controls['identification_country'].setValue(null);

    expect(form.controls['identification_country'].valid).toBe(true);
  });
});
