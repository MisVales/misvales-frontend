import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { adultBirthDateValidator } from '../validators/adult-birth-date.validator';

export class FamiliarFormFactory {
  static create(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null], // Frontend logic only
      relationship: ['', [Validators.required]],
      first_name: ['', [Validators.required, Validators.maxLength(100)]],
      first_last_name: ['', [Validators.required, Validators.maxLength(100)]],
      second_last_name: ['', [Validators.maxLength(100)]],
      birth_date: ['', [Validators.required, adultBirthDateValidator]],
      school_name: ['', [Validators.maxLength(150)]],
      is_family_reference: [false],
      details_payload: [null]
    });
  }

  static createArray(fb: FormBuilder): FormArray {
    return fb.array([]);
  }
}
