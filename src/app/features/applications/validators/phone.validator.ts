import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    try {
      const raw = String(control.value).trim();
      const phone = parsePhoneNumberFromString(raw);
      if (!phone) {
        return { invalidPhone: true };
      }
      if (phone.nationalNumber.length !== 10) {
        return {
          phoneLength: {
            message: 'El número telefónico debe tener exactamente 10 dígitos nacionales.',
          },
        };
      }
      const valid = isValidPhoneNumber(raw);
      return valid ? null : { invalidPhone: true };
    } catch {
      return { invalidPhone: true };
    }
  };
}
