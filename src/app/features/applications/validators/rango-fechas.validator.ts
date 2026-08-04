import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function rangoFechasValidator(fechaInicioControlName: string, fechaFinControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const startControl = formGroup.get(fechaInicioControlName);
    const endControl = formGroup.get(fechaFinControlName);

    if (!startControl || !endControl) {
      return null;
    }

    const startVal = startControl.value;
    const endVal = endControl.value;

    if (!startVal || !endVal) {
      return null; // Don't validate if one is missing (handled by required validator)
    }

    const start = new Date(startVal);
    const end = new Date(endVal);

    if (end < start) {
      // Set error on the end date control as well
      endControl.setErrors({ ...endControl.errors, dateRangeInvalid: true });
      return { dateRangeInvalid: true };
    } else {
      // Clear error if it was set previously
      if (endControl.hasError('dateRangeInvalid')) {
        const errors = { ...endControl.errors };
        delete errors['dateRangeInvalid'];
        endControl.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  };
}
