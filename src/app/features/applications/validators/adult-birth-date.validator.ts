import { AbstractControl, ValidationErrors } from '@angular/forms';

export const MIN_BIRTH_DATE = '1900-01-01';

/** La solicitud sólo admite personas mayores de edad. */
export function adultBirthDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { invalidBirthDate: true };
  }

  const birthDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birthDate.getTime()) || birthDate.toISOString().slice(0, 10) !== value) {
    return { invalidBirthDate: true };
  }

  if (value < MIN_BIRTH_DATE) {
    return { birthDateTooEarly: true };
  }

  const limit = new Date();
  limit.setHours(0, 0, 0, 0);
  limit.setFullYear(limit.getFullYear() - 18);

  return birthDate > limit ? { mustBeAdult: true } : null;
}
