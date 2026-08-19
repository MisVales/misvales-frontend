import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function decimalStringValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    const value = String(control.value).trim();

    if (value.startsWith('-')) {
      return { negativeDecimal: true };
    }

    // Allows positive integers or decimals with up to 4 decimal places.
    // Example valid: "100", "100.5", "100.5555"
    // Invalid: "100.55555", "-10", "abc"
    const regex = /^\d+(\.\d{1,4})?$/;
    
    if (!regex.test(value)) {
      return { invalidDecimalString: true };
    }

    return null;
  };
}

export function positiveDecimalStringValidator(): ValidatorFn {
  const decimalValidator = decimalStringValidator();

  return (control: AbstractControl): ValidationErrors | null => {
    const decimalError = decimalValidator(control);
    if (decimalError) return decimalError;

    if (!control.value) return null;

    return Number(control.value) > 0 ? null : { positiveDecimal: true };
  };
}
