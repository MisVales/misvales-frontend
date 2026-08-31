import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const RFC_REGEX = /^([A-Z\u00D1&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z\d]{2})([A\d])$/i;

export function rfcValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Optional, so empty is valid
    }

    const val = String(control.value).trim().toUpperCase();
    if (val.length < 12 || val.length > 13) {
      return { invalidRfc: true };
    }

    // Regex for Mexican RFC (Physical Person: 13 chars, Moral Person: 12 chars)
    const valid = RFC_REGEX.test(val);

    return valid ? null : { invalidRfc: true };
  };
}
