import { FormControl, FormGroup } from '@angular/forms';

import { passwordMatchValidator } from './password-match.validator';

describe('passwordMatchValidator', () => {
  it('requires matching values without defining a local password policy', () => {
    const form = new FormGroup(
      {
        password: new FormControl('una-clave'),
        password_confirmation: new FormControl('otra-clave'),
      },
      { validators: [passwordMatchValidator] },
    );

    expect(form.errors).toEqual({ passwordMismatch: true });
    form.controls.password_confirmation.setValue('una-clave');
    expect(form.errors).toBeNull();
  });
});
