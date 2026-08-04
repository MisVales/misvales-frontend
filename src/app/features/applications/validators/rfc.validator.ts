import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function rfcValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Optional, so empty is valid
    }

    // Basic regex for Mexican RFC (Physical Person: 13 chars, Moral Person: 12 chars)
    const rfcRegex = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/i;

    const valid = rfcRegex.test(control.value.toUpperCase());

    return valid ? null : { invalidRfc: true };
  };
}
