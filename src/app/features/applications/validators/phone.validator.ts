import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    try {
      const raw = String(control.value).trim();
      const valid = isValidPhoneNumber(raw);
      if (!valid) {
        return { invalidPhone: true };
      }

      const parsed = parsePhoneNumberFromString(raw);
      if (parsed) {
        // Enforce 10 digits for national number
        if (parsed.nationalNumber.length !== 10) {
          return { invalidPhone: true };
        }
      } else {
        const digitsOnly = raw.replace(/\D/g, '');
        if (digitsOnly.length !== 10 && digitsOnly.length !== 12) {
          return { invalidPhone: true };
        }
      }

      return null;
    } catch {
      return { invalidPhone: true };
    }
  };
}
