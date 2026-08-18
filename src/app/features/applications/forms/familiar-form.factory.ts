import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';

function fechaNacimientoAnteriorAHoy(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Number.isNaN(date.getTime()) || date >= today ? { birthDateMustBePast: true } : null;
}

export class FamiliarFormFactory {
  static create(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null], // Frontend logic only
      relationship: ['', [Validators.required]],
      first_name: ['', [Validators.required, Validators.maxLength(100)]],
      first_last_name: ['', [Validators.required, Validators.maxLength(100)]],
      second_last_name: ['', [Validators.maxLength(100)]],
      birth_date: ['', [Validators.required, fechaNacimientoAnteriorAHoy]],
      declared_age: [null, [Validators.min(0), Validators.max(120)]],
      school_name: ['', [Validators.maxLength(150)]],
      is_family_reference: [false],
      details_payload: [null]
    });
  }

  static createArray(fb: FormBuilder): FormArray {
    return fb.array([]);
  }
}
