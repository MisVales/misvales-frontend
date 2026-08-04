import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function decimalStringValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    // Allows positive integers or decimals with up to 4 decimal places.
    // Example valid: "100", "100.5", "100.5555"
    // Invalid: "100.55555", "-10", "abc"
    const regex = /^\d+(\.\d{1,4})?$/;
    
    if (typeof control.value !== 'string' || !regex.test(control.value)) {
      return { invalidDecimalString: true };
    }

    return null;
  };
}
