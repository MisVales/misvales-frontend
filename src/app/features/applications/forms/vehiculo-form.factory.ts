import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

export class VehiculoFormFactory {
  static create(fb: FormBuilder): FormGroup {
    const currentYear = new Date().getFullYear();
    return fb.group({
      id: [null],
      vehicle_type: ['', [Validators.required]],
      brand: ['', [Validators.maxLength(50)]], // Optional according to doc "No hacer obligatoria marca/modelo si backend no lo exige"
      model: ['', [Validators.maxLength(50)]],
      model_year: [null, [Validators.min(2016), Validators.max(currentYear + 1)]],
      ownership_status: ['', [Validators.required]],
      details_payload: [null]
    });
  }

  static createArray(fb: FormBuilder): FormArray {
    return fb.array([]);
  }
}
