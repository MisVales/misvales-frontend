import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValidPhoneNumber } from 'libphonenumber-js';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    try {
      const valid = isValidPhoneNumber(control.value);
      return valid ? null : { invalidPhone: true };
    } catch {
      return { invalidPhone: true };
    }
  };
}
