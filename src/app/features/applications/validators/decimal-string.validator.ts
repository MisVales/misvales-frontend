import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function decimalStringValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    const val = String(control.value).trim();
    // Allows positive integers or decimals with up to 4 decimal places.
    // Example valid: "100", "100.5", "100.5555"
    // Invalid: "100.55555", "-10", "abc"
    const regex = /^\d+(\.\d{1,4})?$/;
    
    if (!regex.test(val)) {
      return { invalidDecimalString: true };
    }

    return null;
  };
}
