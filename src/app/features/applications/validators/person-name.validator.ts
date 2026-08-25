import { AbstractControl, ValidationErrors } from '@angular/forms';

const PERSON_NAME_PATTERN = /^\p{L}[\p{L}\s.'-]*$/u;

export function personNameValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (value === null || value === undefined || value === '') {
    return null;
  }

  return PERSON_NAME_PATTERN.test(String(value).trim()) ? null : { personName: true };
}
