import { AbstractControl, ValidationErrors } from '@angular/forms';

/** La solicitud sólo admite personas mayores de edad. */
export function adultBirthDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const birthDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return { invalidBirthDate: true };

  const limit = new Date();
  limit.setHours(0, 0, 0, 0);
  limit.setFullYear(limit.getFullYear() - 18);

  return birthDate > limit ? { mustBeAdult: true } : null;
}
