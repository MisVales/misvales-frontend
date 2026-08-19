import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Rechaza fechas posteriores al día actual sin depender de una respuesta de la API. */
export function notFutureDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { invalidDate: true };
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return { invalidDate: true };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date > today ? { dateAfterToday: true } : null;
}
