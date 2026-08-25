import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { positiveDecimalStringValidator } from '../validators/decimal-string.validator';

export class DomicilioFormFactory {
  static create(fb: FormBuilder): FormGroup {
    return fb.group({
      id: [null],
      is_current: [false],
      street: ['', [Validators.required, Validators.maxLength(100)]],
      exterior_number: ['', [Validators.required, Validators.maxLength(20)]],
      interior_number: ['', [Validators.maxLength(20)]],
      neighborhood: ['', [Validators.required, Validators.maxLength(100)]],
      postal_code: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      municipality: ['', [Validators.required, Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.maxLength(100)]],
      state: ['', [Validators.required, Validators.maxLength(50)]],
      country: ['MX', [Validators.required]],
      housing_tenure: ['', [Validators.required]],
      financing_status: ['', [Validators.required]],
      width_meters: ['', [Validators.required, positiveDecimalStringValidator()]],
      length_meters: ['', [Validators.required, positiveDecimalStringValidator()]],
      built_area_square_meters: ['', [Validators.required, positiveDecimalStringValidator()]],
      details_payload: [null]
    });
  }

  static createArray(fb: FormBuilder): FormArray {
    return fb.array([]);
  }
}
