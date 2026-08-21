import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function curpValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Required validation is handled separately
    }

    // Basic regex for Mexican CURP (18 alphanumeric characters as requested)
    const curpRegex = /^[A-Z\d]{18}$/i;
    
    // Masked curp check
    if (control.value.includes('*')) {
       return null; // If it's a masked curp, it's valid to hold in state (although we won't allow submitting it)
    }

    const valid = curpRegex.test(control.value.toUpperCase());

    return valid ? null : { invalidCurp: true };
  };
}
